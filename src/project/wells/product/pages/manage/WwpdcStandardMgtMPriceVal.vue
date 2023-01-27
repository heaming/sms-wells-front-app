<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : PDC (상품운영관리)
2. 프로그램 ID : WwpdcStandardMgtMPriceVal - 기준상품 등록/변경- 가격정보 - 선택변수 등록 (  )
3. 작성자 : jintae.choi
4. 작성일 : 2022.12.31
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 상품 기준상품 등록/변경- 가격정보 - 선택변수 등록 프로그램
****************************************************************************************************
--->
<template>
  <div class="normal-area">
    <!-- 선택변수 등록 -->
    <h3>{{ $t('MSG_TXT_PD_REG_SEL_VAR') }}</h3>
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 판매채널 -->
        <kw-form-item :label="$t('MSG_TXT_SEL_CHNL')">
          <kw-select
            v-model="addChannelId"
            :options="usedChannelCds"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-form
      :cols="2"
      dense
    >
      <kw-form-row>
        <!-- 선택변수 -->
        <kw-form-item :label="$t('MSG_TXT_PD_SEL_VAL')">
          <slot
            v-for="(sv, i) of selectionVariables"
            :key="sv.codeId"
          >
            <kw-checkbox
              v-model="checkedSelVals[i]"
              :label="sv.codeName"
              :true-value="sv.codeId"
              :false-value="null"
              @update:model-value="resetVisibleChannelColumns"
            />
          </slot>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-bottom class="mb30">
      <kw-btn
        v-show="!props.readonly"
        :label="$t('MSG_BTN_ADD')"
        dense
        @click="onClickAdd"
      />
    </kw-action-bottom>

    <kw-action-top>
      <kw-btn
        v-show="!props.readonly"
        :label="$t('MSG_BTN_DEL')"
        dense
        @click="onClickRemove"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      :visible-rows="5"
      @init="initGrid"
    />
  </div>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, gridUtil, getComponentType } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import pdConst from '~sms-common/product/constants/pdConst';
import { getGridRowsToSavePdProps, getPropInfosToGridRows, getPdMetaToGridInfos } from '~sms-common/product/utils/pdUtil';

/* eslint-disable no-use-before-define */
defineExpose({
  getSaveData, isModifiedProps, validateProps,
});

const props = defineProps({
  pdCd: { type: String, default: null },
  initData: { type: Object, default: null },
  metaInfos: { type: Object, default: null },
  codes: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
});

const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const prcd = pdConst.TBL_PD_PRC_DTL;
const prcfd = pdConst.TBL_PD_PRC_FNL_DTL;
const currentPdCd = ref();
const currentInitData = ref(null);
const currentMetaInfos = ref();
const usedChannelCds = ref([]);
const addChannelId = ref();
const checkedSelVals = ref([]);
const selectionVariables = ref([]);
const removeObjects = reactive([]);

async function resetInitData() {
  Object.assign(removeObjects, []);
  // 기본 속성에서 등록 채널 목록
  const channels = currentInitData.value?.[pdConst.TBL_PD_DTL]
    ?.reduce((rtn, item) => {
      if (item.avlChnlId) {
        rtn.push(item.avlChnlId);
      }
      return rtn;
    }, [])
    ?.join(',');
  // console.log(' channels : ', channels);
  if (channels) {
    usedChannelCds.value = props.codes?.SELL_CHNL_DV_CD.filter((item) => channels.indexOf(item.codeId) > -1);
  }
  await initGridRows();
}

async function initGridRows() {
  if (await currentInitData.value[prcfd]) {
    const rows = cloneDeep(await getPropInfosToGridRows(
      currentInitData.value?.[prcfd],
      currentMetaInfos.value,
      '',
      [pdConst.PRC_STD_ROW_ID, pdConst.PRC_FNL_ROW_ID],
    ));
    rows?.map((row) => {
      row[pdConst.PRC_FNL_ROW_ID] = row[pdConst.PRC_FNL_ROW_ID] ?? row.pdPrcFnlDtlId;
      row.pdPrcDtlIdRefVp = row.pdPrcDtlId;
      return row;
    });
    // console.log('Rows : ', rows);
    const view = grdMainRef.value.getView();
    view.getDataSource().setRows(rows);
    view.resetCurrent();
  }
}

async function onClickAdd() {
  if (isEmpty(addChannelId.value)) {
    return;
  }

  if (await currentInitData.value[prcd]) {
    const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
    const stdRows = cloneDeep(
      await getPropInfosToGridRows(
        currentInitData.value?.[prcd],
        currentMetaInfos.value,
        prcd,
      ),
    // 기존에 추가된 ROW가 없는 행만 추가
    );
    console.log('rowValues : ', rowValues);
    console.log('stdRows : ', stdRows);
    const view = grdMainRef.value.getView();
    const data = view.getDataSource();
    let insPosition = rowValues.findIndex((gridRow) => gridRow.sellChnlCd === addChannelId.value);
    if (!insPosition || insPosition < 0) {
      insPosition = 0;
    }
    if (stdRows && stdRows.length) {
      stdRows.forEach((row) => {
        row.sellChnlCd = addChannelId.value;
        row[pdConst.PRC_FNL_ROW_ID] = stringUtil.getUid('FNL');
        row.pdPrcDtlIdRefVp = row.pdPrcDtlId;
        console.log('row[pdConst.PRC_FNL_ROW_ID] : ', row[pdConst.PRC_FNL_ROW_ID]);
        if (!rowValues.find((gridRow) => addChannelId.value === gridRow.sellChnlCd
        && row.pdPrcDtlId === gridRow.pdPrcDtlId)) {
          data.insertRow(insPosition, row);
        }
      });
    }
  }
}

async function onClickRemove() {
  const deletedRowValues = gridUtil.deleteCheckedRows(grdMainRef.value.getView());
  if (deletedRowValues && deletedRowValues.length) {
    removeObjects.push(...deletedRowValues.reduce((rtn, item) => {
      if (item[pdConst.PRC_FNL_ROW_ID]) {
        rtn.push({ [pdConst.PRC_FNL_ROW_ID]: item[pdConst.PRC_FNL_ROW_ID] });
      }
      return rtn;
    }, []));
  }
}

async function getSaveData() {
  const rowValues = gridUtil.getAllRowValues(grdMainRef.value.getView());
  const rtnValues = await getGridRowsToSavePdProps(
    rowValues,
    currentMetaInfos.value,
    prcfd,
    [pdConst.PRC_FNL_ROW_ID],
  );
  if (removeObjects.length) {
    rtnValues[pdConst.REMOVE_ROWS] = cloneDeep(removeObjects);
  }
  // console.log('WwpdcStandardMgtMPriceVal - getSaveData - rtnValues : ', rtnValues);
  return rtnValues;
}

function isModifiedProps() {
  return true;
}

function validateProps() {
  return true;
}

async function initProps() {
  const { pdCd, initData, metaInfos } = props;
  currentPdCd.value = pdCd;
  currentInitData.value = initData;
  currentMetaInfos.value = metaInfos;
  await fetchSelVarData();
}

async function fetchSelVarData() {
  const res = await dataService.get('/sms/common/product/type-variables', { params: { sellTpCd: pdConst.W_SELL_TP_CD_LENT_OR_LEASS } });
  console.log('selectionVariables.value : ', selectionVariables.value);
  selectionVariables.value = res.data;
}

async function resetVisibleChannelColumns() {
  console.log('checkedSelVals : ', checkedSelVals.value);
  selectionVariables.value.forEach((field) => {
    const view = grdMainRef.value.getView();
    const column = view.columnByName(field.colNm);
    if (column) {
      if (checkedSelVals.value && checkedSelVals.value.includes(field.colNm)) {
        column.visible = true;
      } else {
        column.visible = false;
      }
    }
  });
}

await initProps();

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
async function initGrid(data, view) {
  const { metaInfos } = props;
  currentMetaInfos.value = metaInfos;
  const { fields, columns } = await getPdMetaToGridInfos(
    currentMetaInfos.value,
    [pdConst.PD_PRC_TP_CD_BASIC,
      pdConst.PD_PRC_TP_CD_VARIABLE],
    props.codes,
    pdConst.DEFAULT_READ_ONLY_FIELDS,
  );

  /* selectionVariables.value?.forEach((item) => {
    // todo push
    columns.unshift({ fieldName: item.codeId, header: item.codeName, width: '200' });
    fields.unshift({ fieldName: item.codeId });
  }); */

  // Grid 내부키 - '신규 Row 추가' 대응
  fields.push({ fieldName: pdConst.PRC_STD_ROW_ID });
  fields.push({ fieldName: pdConst.PRC_FNL_ROW_ID });
  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = true;
  await resetInitData();
  await resetVisibleChannelColumns();
}

watch(() => props.pdCd, (val) => { currentPdCd.value = val; });
watch(() => props.initData, (val) => { currentInitData.value = val; resetInitData(); }, { deep: true });
</script>
