import { isRef, warn } from 'vue';
import { alert } from 'kw-lib';

export const EMPTY_SYM = Symbol.for('__undef__');
export const EMPTY_ID = ' '; /* TODO: FIXME... */

export default (
  priceDefineVariables,
  finalPriceOptions,
  labelGenerator = {},
  priceOptionFilter = undefined,
) => {
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

  const variableNames = computed(() => Object.getOwnPropertyNames(priceDefineVariables.value));

  const initializePriceDefineVariable = () => {
    variableNames.value.forEach((variable) => {
      if (typeof variable !== 'string') {
        warn('가격 결정 요소의 키 값은 문자열로 제한됩니다.');
        return;
      }
      priceDefineVariables.value[variable] = undefined;
    });
  };

  initializePriceDefineVariable();

  const filteredVariableNames = computed(() => Object.getOwnPropertyNames(unref(priceOptionFilter) ?? {}));

  const filteredFinalPriceOptions = ref(unref(finalPriceOptions));

  const generateValueKey = (value) => (value ? String(value) : EMPTY_SYM);

  const pushIfFinalPriceSelectable = (varKeyToSelectables, finalPrice, variableName) => {
    const exceptIdx = variableNames.value.indexOf(variableName);
    if (exceptIdx < 0) {
      warn('상품가격 결정요소를 확인해보세요.');
      return false;
    }
    const anotherVariableNames = variableNames.value.toSpliced(exceptIdx, 1);

    const existUnmatchedOtherVar = anotherVariableNames.some((varName) => {
      const selectedAnotherVar = priceDefineVariables.value[varName];
      const curPriceAnotherVar = finalPrice[varName];
      if (!selectedAnotherVar || selectedAnotherVar === EMPTY_ID) {
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

  const varNameToSelectablesDictMap = computed(() => variableNames.value
    .reduce((varNameToSelectablesDict, variableName) => {
      varNameToSelectablesDict[variableName] = filteredFinalPriceOptions.value
        ?.reduce((
          varKeyToSelectables,
          finalPrice,
        ) => pushIfFinalPriceSelectable(varKeyToSelectables, finalPrice, variableName), {});
      return varNameToSelectablesDict;
    }, {}));

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

  const getSelectable = (variableName) => priceDefineVariableOptions
    .value[variableName]?.map((code) => code.codeId) ?? [];

  const unsetIfNotSelectable = (variableName) => {
    const selectable = getSelectable(variableName);
    const curValue = priceDefineVariables.value[variableName];
    if (!selectable.includes(curValue)) {
      priceDefineVariables.value[variableName] = undefined;
    }
  };

  const setIfUniqueSelectable = (variableName) => {
    const selectable = getSelectable(variableName);
    const curValue = priceDefineVariables.value[variableName];
    if (!selectable.includes(curValue)) {
      if (selectable.length === 1 && curValue === undefined) {
        priceDefineVariables.value[variableName] = selectable[0];
      } else if (!selectable.includes(curValue)) {
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
        .filter((finalPriceOption) => !filteredVariableNames.value
          .some((filteredVar) => {
            const optionsVar = finalPriceOption[filteredVar];
            const filterVar = priceOptionFilter.value[filteredVar];
            return (optionsVar || EMPTY_ID) !== (filterVar || EMPTY_ID);
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
    setVariablesIfUniqueSelectable();
  };

  watch(priceOptionFilter, onChangePriceOptionFilter);

  const onChangeFinalPriceOptions = () => {
    filteringFinalPriceOptions();
    setVariablesIfUniqueSelectable();
  };

  watch(finalPriceOptions, onChangeFinalPriceOptions);

  const selectedFinalPrices = computed(() => filteredFinalPriceOptions.value
    ?.filter((finalPrice) => variableNames.value
      .every((variableName) => {
        // FIXME: 가격 안정되면 해당 기능 제거. 선택 가능한 값이 없으면 제외. ?? 왜?
        const selectable = getSelectable(variableName);
        if (!selectable.length) {
          return true;
        }

        const curValue = priceDefineVariables.value[variableName] === EMPTY_ID
          ? EMPTY_SYM
          : priceDefineVariables.value[variableName]; /* could be undefined */
        const targetValue = generateValueKey(finalPrice[variableName]); /* can not be undefined */

        return targetValue === curValue;
      })));

  const selectedFinalPrice = computed(() => {
    const selectedPrice = filteredFinalPriceOptions.value
      ?.filter((finalPrice) => variableNames.value
        .every((variableName) => {
          // 선택 가능한 값이 없으면 제외. ?? 왜?
          const selectable = getSelectable(variableName);
          if (!selectable.length) {
            return true;
          }

          const curValue = priceDefineVariables.value[variableName] === EMPTY_ID
            ? EMPTY_SYM
            : priceDefineVariables.value[variableName]; /* could be undefined */
          const targetValue = generateValueKey(finalPrice[variableName]); /* can not be undefined */

          if (targetValue !== curValue) {
            console.log(variableName, targetValue, curValue);
          }

          return targetValue === curValue;
        }));
    if (selectedPrice.length > 1) {
      return undefined;
    }
    if (selectedPrice.length < 1) {
      return undefined;
    }
    return selectedPrice[0];
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
