import { isRef, warn } from 'vue';
import { alert } from 'kw-lib';

/**
 * falsy 한 값을 표기하기 위한 심볼
 * @type {symbol}
 */
export const EMPTY_SYM = Symbol.for('__undef__');

/**
 * kw-select 에 사용자가 falsy 한 값을 선택했음을 알리기 위한 string. 아마 심볼 안 받을껄?
 * 선택 된 값 특히, priceDefineVariables 값으로 지정 될 예정.
 * 해당 값이면 falsy 한 값을 선택한 것이므로 예외 처리 잘 해줄 것.
 * 절대 빈 스트링으로 만들지 마세요... ㅠㅠ 나도 이러고 싶지 않았어.
 *
 * @type {string}
 */
export const EMPTY_ID = ' ';

export default (
  priceDefineVariables,
  finalPriceOptions,
  labelGenerator = {},
  priceOptionFilter = undefined,
) => {
  /* region [validate inputs] */
  if (!isRef(priceDefineVariables)) {
    warn('가격 정의 변수 객체 은 ref 여야 합니다.');
  } else {
    priceDefineVariables = ref(priceDefineVariables ?? {});
  }

  if (!isRef(finalPriceOptions)) {
    warn('최종가격 목록은 ref 여야 합니다.');
  }

  if (!!priceOptionFilter && !isRef(priceOptionFilter)) {
    warn('가격 필터는 ref 여야 합니다.');
  }
  /* endregion [validate inputs] */

  /**
   * 가격 결정 요소 목록: computed ref.
   *
   * @type {ComputedRef<string[]>}
   */
  const variableNames = computed(() => Object.getOwnPropertyNames(priceDefineVariables.value));

  /**
   * 가격 결정 요소 의 값 기준으로 키 채번을 하는 함수이다.
   *
   * @param value 가격 결정 요소의 값들 (eg. undefined, '11')
   * @return {string|symbol} 빈 값일 경우 EMPTY_SYM symbol 을 반환한다.
   * getOwnPropertyNames iterator 에 포함 시키지 않기 위함이다.
   */
  const generateValueKey = (value) => {
    if (value === EMPTY_SYM || !value) { return EMPTY_SYM; }
    return String(value);
  };

  /**
   * 제공 된 가격 옵션 목록 으로 부터 가격 결정 요소의 이름과 값으로 선택 가능한 옵션이 있는 지 반환한다.
   * equivalence 는 값 - 키채번 로직과 우선 같게 가져갑니다. falsy 한 값을 다 같은 값으로 본다는 뜻. EMPTY_ID 와는 다릅니다.
   * // based on "NOT" filtered
   *
   * @param variableName 가격 결정 요소 명 (eg. 'rentalDscTpCd')
   * @param value 가격 결정 요소 값 (eg. undefined, '82')
   * @return {boolean}
   */
  const existPriceOptionSuchAs = (variableName, value) => {
    if (!finalPriceOptions.value?.length) {
      return false;
    }
    if (!variableNames.value?.includes(variableName)) {
      warn(`${variableName} 는 가격 결정 요소의 이름이 아닙니다.`);
    }

    return finalPriceOptions.value
      .some((finalPriceOption) => {
        const targetValue = generateValueKey(finalPriceOption[variableName]);
        const testValue = generateValueKey(value);
        return targetValue === testValue;
      });
  };

  /**
   * undefined 로 초기화 합니다.
   */
  const initializePriceDefineVariable = () => {
    variableNames.value.forEach((variable) => {
      if (typeof variable !== 'string') {
        warn('가격 결정 요소의 키 값은 문자열로 제한됩니다.');
        return;
      }
      priceDefineVariables.value[variable] = undefined;
    });
  };

  initializePriceDefineVariable(); // TODO : ... 필요한가?

  const normalizedOptionFilter = computed(() => {
    const optionFilter = unref(priceOptionFilter);
    if (!optionFilter || !typeof optionFilter === 'object') {
      return {};
    }

    const normalizePriceOptionFilterValue = (filterValue) => {
      if (typeof filterValue !== 'object') {
        return {
          value: filterValue, // EMPTY_ID를 넣으면, falsy 한 값으로 강제합니다. 진짜 falsy 한 값을 하면 해당 필터를 무시합니다.
          fallback: undefined, // 해당 값으로 선택 가능한 가격이 없으면, 대신 적용할 제한 옵션입니다. 역시나 없으면 falsy 하면 무시합니다.
          ignoreIfNotExist: false, // 선택 가능한 가격이 없으면, 해당 필터를 무시할지 여부입니다.
          // whiteList: undefined,
          // blackList: undefined,
        };
      }
      filterValue.fallback ??= EMPTY_ID;
      filterValue.ignoreIfNotExist ??= false;
      return filterValue;
    };

    const names = Object.getOwnPropertyNames(optionFilter);
    return names.reduce((normalized, name) => {
      normalized[name] = normalizePriceOptionFilterValue(optionFilter[name]);
      return normalized;
    }, {});
  });

  /**
   * 가격 옵션에 제한을 걸 경우, 제한이 해당되는 필드의 이름들.
   */
  const filteredVariableNames = computed(() => Object.getOwnPropertyNames(normalizedOptionFilter.value));

  /**
   * 필터링 된 가격 옵션 제한으로 필터링 된 선택가능한 가격입니다.
   */
  const filteredFinalPriceOptions = ref(unref(finalPriceOptions));

  /**
   * 가격 옵션 객체 (finalPrice)의 가격 결정 요소 (variableName)의 값 (eg. '82', undefined ) 으로 부터 생성된 키를 필드 이름, (eg. '82', EMPTY_SYM)
   * 해당 가격 결정 요소를 해당 값으로 가지며, '현재 선택 가능한' 가격 옵션 객체의 배열을 필드 값 으로 가지는 객체을 생성하기 위한 reducer 입니다.
   * '현재 선택 가능한' 을 판단하기 위해 해당 가격 결정 요소를 제한 다른 옵션이 현재 선택된 가격 결정 요소와 모두 같은지 판단합니다.
   *
   * @param varKeyToSelectables - accumulator
   * @param finalPrice - 어디든 집어 넣을 가격
   * @param variableName - 기준이 가격 결정 요소
   * @return {*}
   */
  const pushIfFinalPriceSelectable = (varKeyToSelectables, finalPrice, variableName) => {
    const exceptIdx = variableNames.value.indexOf(variableName);
    if (exceptIdx < 0) {
      warn('상품가격 결정요소를 확인해보세요.');
      return varKeyToSelectables;
    }
    const anotherVariableNames = variableNames.value.toSpliced(exceptIdx, 1);

    const existUnmatchedOtherVar = anotherVariableNames.some((varName) => {
      const selectedAnotherVar = priceDefineVariables.value[varName];
      const curPriceAnotherVar = generateValueKey(finalPrice[varName]);
      // falsy... 처리가 애매하다. 각 컴포넌트는 '' 를 거짓 값으로 가져서 의미있는 값으로 판단하기 위해 먼저 체크한다.
      if (selectedAnotherVar === EMPTY_ID) {
        return curPriceAnotherVar !== EMPTY_SYM;
      }
      if (!selectedAnotherVar) {
        return false;
      }
      return curPriceAnotherVar !== selectedAnotherVar;
    });

    if (existUnmatchedOtherVar) {
      return varKeyToSelectables;
    }

    const key = generateValueKey(finalPrice[variableName]);
    varKeyToSelectables[key] ??= [];
    varKeyToSelectables[key].push(finalPrice);

    return varKeyToSelectables;
  };

  /**
   * 가격 옵션 객체 (finalPrice)의 가격 결정 요소 (variableName)의 값 으로 부터 생성된 키를 필드 이름, (eg. '82', EMPTY_SYM)
   * 해당 가격 결정 요소를 해당 값으로 가지며, '현재 선택 가능한' 가격 옵션 객체의 배열을 필드 값 으로 가지는 객체의 계산 값.
   *
   * @type {ComputedRef<*>}
   */
  const varNameToSelectablesDictMap = computed(() => variableNames.value
    .reduce((varNameToSelectablesDict, variableName) => {
      varNameToSelectablesDict[variableName] = filteredFinalPriceOptions.value
        ?.reduce((
          varKeyToSelectables,
          finalPrice,
        ) => pushIfFinalPriceSelectable(varKeyToSelectables, finalPrice, variableName), {});
      return varNameToSelectablesDict;
    }, {}));

  /**
   * 각 가격 결정 요소를 필드의 이름,
   * 모든 가격 옵션에 대해, 각 가격 결정 요소가 선택 가능한 한 모든 값 을 labelGenerator 를 통해 라벨링 된 코드 값의 목록을 필드의 값으로
   * 가지는 객체의 계산값
   *
   * EMPTY_SYM -> EMPTY_ID 로 치환된다.
   *
   * @type {ComputedRef<*>}
   */
  const priceDefineVariableOptions = computed(() => variableNames.value
    .reduce((varNameToOptionsMap, variableName) => {
      const varToSelectables = varNameToSelectablesDictMap.value[variableName];
      const options = [];
      if (varToSelectables[EMPTY_SYM]?.length > 0) {
        options.push({
          codeId: EMPTY_ID,
          codeName: labelGenerator[variableName]?.(EMPTY_ID) || '선택안함',
        });
      }
      const selectableValues = Object.getOwnPropertyNames(varToSelectables);
      selectableValues
        .forEach((key) => {
          const selectableFinalPrices = varToSelectables[key];
          if (!selectableFinalPrices?.length) {
            return;
          }
          const finalPrice = selectableFinalPrices?.[0];
          const value = finalPrice[variableName];
          const label = labelGenerator[variableName] ? labelGenerator[variableName]?.(value, finalPrice) : value;
          options.push({
            codeId: value,
            codeName: label,
          });
        });

      varNameToOptionsMap[variableName] = options;
      return varNameToOptionsMap;
    }, {}));

  /**
   * falsy === EMPTY_ID
   * @param variableName
   * @return {*|*[]}
   */
  const getSelectable = (variableName) => priceDefineVariableOptions
    .value[variableName]?.map((code) => code.codeId) ?? [];

  const unsetIfNotSelectable = (variableName) => {
    const selectable = getSelectable(variableName);
    const selectedValue = priceDefineVariables.value[variableName];
    if (!selectable.includes(selectedValue)) {
      priceDefineVariables.value[variableName] = undefined;
    }
  };

  const setIfUniqueSelectable = (variableName) => {
    const selectable = getSelectable(variableName);
    const selectedValue = priceDefineVariables.value[variableName];
    if (!selectable.includes(selectedValue)) {
      if (selectable.length === 1 && selectedValue === undefined) {
        priceDefineVariables.value[variableName] = selectable[0];
      } else if (!selectable.includes(selectedValue)) {
        priceDefineVariables.value[variableName] = undefined;
      }
    }
  };

  const setVariablesIfUniqueSelectable = () => {
    variableNames.value
      .forEach((variableName) => {
        setIfUniqueSelectable(variableName);
      });
  };

  const setPriceDefineVariablesBy = (pdPrcFnlDtlId) => {
    if (!pdPrcFnlDtlId) {
      return;
    }
    const selectedFinalPrice = filteredFinalPriceOptions.value
      ?.find((finalPrice) => (finalPrice.pdPrcFnlDtlId === pdPrcFnlDtlId));

    if (!selectedFinalPrice) {
      warn('저장된 가격이 상이합니다.');
      return;
    }

    variableNames.value.forEach((variableName) => {
      priceDefineVariables.value[variableName] = selectedFinalPrice[variableName] ?? EMPTY_ID;
    });
  };

  const filteringFinalPriceOptions = () => {
    if (!finalPriceOptions.value?.length) {
      return;
    }

    filteredFinalPriceOptions.value = finalPriceOptions.value;

    let filtered = finalPriceOptions.value;

    if (filteredVariableNames.value.length) {
      filtered = finalPriceOptions.value
        /* 가격 제한 옵션의 가격 결정 요소들 중 하나라도 일치하지 않으면 밴한다. */
        .filter((finalPriceOption) => !filteredVariableNames.value
          .some((filteredVarName) => {
            const optionsVar = generateValueKey(finalPriceOption[filteredVarName]);
            const {
              value,
              fallback,
              ignoreIfNotExist,
            } = normalizedOptionFilter.value[filteredVarName];
            if (!value) { return false; }
            const selectableExist = existPriceOptionSuchAs(filteredVarName, value);
            if (ignoreIfNotExist && !selectableExist) { return false; }
            const filterVar = selectableExist ? value : fallback;
            if (filterVar === EMPTY_ID) {
              return optionsVar !== EMPTY_SYM;
            }
            if (!filterVar) { return false; }
            return optionsVar !== filterVar;
          }));
    }

    filteredFinalPriceOptions.value = filtered;

    if (!filteredFinalPriceOptions.value.length) {
      alert('필터에 해당하는 가격 조건이 없습니다.');
    }

    setVariablesIfUniqueSelectable();
  };

  filteringFinalPriceOptions();

  const onChangePriceOptionFilter = () => {
    filteringFinalPriceOptions();
    filteredVariableNames.value.forEach(setIfUniqueSelectable); /* 필터링 된 항목만 박도록 수정 */
  };

  watch(priceOptionFilter, onChangePriceOptionFilter, { deep: true });

  const onChangeFinalPriceOptions = () => {
    filteringFinalPriceOptions();
    setVariablesIfUniqueSelectable();
  };

  watch(finalPriceOptions, onChangeFinalPriceOptions);

  const selectedFinalPrices = computed(() => filteredFinalPriceOptions.value
    ?.filter((finalPrice) => variableNames.value
      .every((variableName) => {
        // FIXME: 가격 안정되면 해당 기능 제거. 선택 가능한 값이 없으면 제외. ?? 왜? => 사용자(= 나) 가 잘못될 필드를 넣을 가능성이 높다.
        const selectable = getSelectable(variableName);
        if (!selectable.length) {
          return true;
        }

        const curValue = priceDefineVariables.value[variableName] === EMPTY_ID
          ? EMPTY_SYM
          : priceDefineVariables.value[variableName]; /* could be undefined */
        const targetValue = generateValueKey(finalPrice[variableName]); /* can not be undefined */

        // fixme: 안정되면 !curValue 제거
        return !curValue || targetValue === curValue;
      })));

  const selectedFinalPrice = computed(() => {
    if (selectedFinalPrices.value.length > 1) {
      return undefined;
    }
    if (selectedFinalPrices.value.length < 1) {
      return undefined;
    }
    return selectedFinalPrices.value[0];
  });

  return {
    priceDefineVariables,
    initializePriceDefineVariable,
    setPriceDefineVariablesBy,
    filteredFinalPriceOptions,
    priceDefineVariableOptions,
    unsetIfNotSelectable,
    setVariablesIfUniqueSelectable,
    selectedFinalPrice,
    selectedFinalPrices,
  };
};
