<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : EwctaContractChgListM - 계약자 명의변경
3. 작성자 : jeongheon lee
4. 작성일 : 2023.12.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [K-W-SS-U-0161M01] 계약자 명의변경
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="3"
    @search="onClickSearch"
    @reset="onClickReset"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DATE', null, '계약일자')"
        :rules="searchParams.cntrNo !== '' ? '' : 'required'"
      >
        <!--  rules="date_range_required|date_range_months:1" -->
        <kw-date-range-picker
          v-model:from="searchParams.conStrtDt"
          v-model:to="searchParams.conEndDt"
          :label="t('MSG_TXT_CNTR_DATE')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NO', null, '고객번호')"
      >
        <kw-input
          v-model="searchParams.cstNo"
          icon="search"
          clearable
          :regex="/^[0-9]*$/i"
          maxlength="10"
          @click-icon="onClickCustomer('search')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CNTR_DTL', null, '계약상세')"
        :required="(searchParams.conStrtDt !== '' && searchParams.conEndDt !== '') ? false : true"
      >
        <kw-input
          v-model="searchParams.cntrNo"
          :label="$t('MSG_TXT_CNTR_NO')"
          maxlength="13"
          icon="search"
          clearable
          :rules="searchParams.conStrtDt !== '' && searchParams.conEndDt !== '' ? '' : 'required'"
          @click-icon="onClickSearchContractNumber"
        />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <h3> {{ t('MSG_TXT_SUB_CHG') }}  </h3>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo.pageIndex"
          v-model:page-size="pageInfo.pageSize"
          :total-count="pageInfo.totalCount"
          :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          @change="fetchData"
        />
      </template>
    </kw-action-top>

    <kw-grid
      ref="grdMainRefChg"
      name="grdMainChg"
      :visible-rows="10"
      :total-count="pageInfo.totalCount"
      @init="initGrid"
    />
    <kw-pagination
      v-model:page-index="pageInfo.pageIndex"
      v-model:page-size="pageInfo.pageSize"
      :total-count="pageInfo.totalCount"
      @change="fetchData"
    />

    <kw-action-top class="mb20 mt70">
      <template #left>
        <h3 class="kw-font-pt20">
          {{ t('MSG_TXT_CHG_INFOR') }}
        </h3>
      </template>
      <kw-btn
        v-if="isSave"
        dense
        primary
        :label="$t('MSG_BTN_SAVE',null, '저장')"
        @click="onClickSave"
      />
    </kw-action-top>
    <kw-form
      ref="frmMainRef"
      :cols="2"
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CLSS_CHG',null, '변경구분')"
          required
        >
          <kw-select
            v-model="searchParams.cstRelTpCd"
            :options="codes.CNTR_CH_TP_CD.filter((v) => ['103' ].includes(v.codeId))"
            :label="t('MSG_TXT_CLSS_CHG')"
            rules="required"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_CH_RSON',null, '변경사유')"
          :required="(searchParams.exemYn === 'N') ? false : true"
        >
          <kw-select
            v-model="searchParams.cntrChRsonCd"
            :options="codes.CMN_STAT_CH_RSON_CD.filter((v) => ['32','36','51' ].includes(v.codeId))"
            :label="t('MSG_TXT_CH_RSON')"
            :rules="searchParams.exemYn === 'N' ? '' : 'required'"
            @update:model-value="onChangeVsKndNm($event )"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CST_NO',null, '고객번호')"
          required
        >
          <kw-input
            v-model="searchParams.cstNoSave"
            icon="search"
            clearable
            :regex="/^[0-9]*$/i"
            maxlength="10"
            rules="required"
            :label="t('MSG_TXT_CST_NO')"
            @click-icon="onClickCustomer('save')"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_EXEM_STT',null, '면책여부')"
          required
        >
          <kw-option-group
            v-model="searchParams.exemYn"
            type="radio"
            rules="required"
            :options="[
              {codeId: 'Y', codeName: 'Y'},
              {codeId: 'N', codeName: 'N'},
            ]"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, useMeta, useDataService, getComponentType, gridUtil } from 'kw-lib'; //   alert,  ,  defineGrid
import { cloneDeep } from 'lodash-es'; // , isEmpty

import dayjs from 'dayjs';

const { getConfig } = useMeta();
const { modal } = useGlobal();
const sessionMeta = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const isSave = ref(false);
let cachedParams;
const { notify, confirm } = useGlobal();
const userInfo = sessionMeta.getUserInfo();
const now = dayjs();
const grdMainRefChg = ref(getComponentType('KwGrid'));
const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
  needTotalCount: true,
});
const codes = await codeUtil.getMultiCodes(
  'CNTR_CH_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'CMN_STAT_CH_RSON_CD',
);

const searchParams = ref({
  conStrtDt: `${now.format('YYYYMM')}01`, /* 변경일자(시작일자) */
  conEndDt: now.format('YYYYMMDD'), /* 변경일자(종료일자) */
  cstRelTpCd: '103', /* 변경대상자구분 */
  cntrChRsonCd: '', /* 계약변경사유코드 */
  cstNo: '', /* 변경고객번호 */
  cntrNo: '', /* 계약번호 */
  cntrSn: '', /* 계약일련번호 */
  cstNoSave: '', /* 저장할 고객번호 */
  exemYn: 'N', /* 면책여부 */
  cntrChRsonNm: '', /* 변경사유명 */
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
// TODO: 고객조회(공통)
async function onClickCustomer(cstNoVal) {
  // 조회용 고객번호
  if (cstNoVal === 'search') {
    const { result, payload } = await modal({
      component: 'ZwcsaCustomerListP',

      componentProps: {
        cstNo: searchParams.value.cstNo,
      },
    });
    if (result) {
      searchParams.value.cstNo = payload.cstNo;
    }
  // 저장용 고객번호
  } else {
    const { result, payload } = await modal({
      component: 'ZwcsaCustomerListP',

      componentProps: {
        cstNoSave: searchParams.value.cstNo,
      },
    });
    if (result) {
      searchParams.value.cstNoSave = payload.cstNo;
    }
  }
}
function onChangeVsKndNm(event) {
  searchParams.value.cntrChRsonNm = codes.CMN_STAT_CH_RSON_CD.find((v) => v.codeId === event).codeName;
}
/**
 * 계약번호 검색 팝업
 *
 * 계약번호 검색 Z 가 아니라 E,W 나뉘어져 있음.
 * E-SS-U-0011P01 = EwctaContractNumberListP
 * W-SS-U-0157P01 = WwctaContractNumberListP
 */
// eslint-disable-next-line no-unused-vars
async function onClickSearchContractNumber() {
  if (userInfo.tenantCd === 'E') {
    const { result, payload } = await modal({
      component: 'EwctaContractNumberListP',
      componentProps: {
        cntrNo: searchParams.value.cntrNo,
        // cntrSn: '1',
      },
    });
    if (result) {
      searchParams.value.cntrNo = payload.cntrNo;
      searchParams.value.cntrSn = payload.cntrSn;
    }
  } else if (userInfo.tenantCd === 'W') {
    const { result, payload } = await modal({
      component: 'WwctaContractNumberListP',
      componentProps: {
        cntrNo: searchParams.value.cntrNo,
        // cntrSn: '1',
      },
    });
    if (result) {
      searchParams.value.cntrNo = payload.cntrNo;
      searchParams.value.cntrSn = payload.cntrSn;
    }
  }
}

/**
 * 조회 함수
 */
async function fetchData() {
  cachedParams = { ...cachedParams, ...pageInfo.value };
  const response = await dataService.get('sms/wells/contract/contract/paging', { params: cachedParams });
  const { list, pageInfo: pageResult } = response.data;
  pageInfo.value = pageResult;
  if (response) {
    isSave.value = true;
  } else {
    isSave.value = false;
  }

  const view = grdMainRefChg.value.getView();

  view.getDataSource().setRows(list);
  view.resetCurrent();
}

/**
 * '조회'버튼을 클릭하는 경우
 */
async function onClickSearch() {
  if (searchParams.value.cntrNo) {
    if (searchParams.value.cntrSn) {
      searchParams.value.cntrNo = `${searchParams.value.cntrNo}`; // ${searchParams.value.cntrSn}
    }
  } else {
    searchParams.value.cntrNo = '';
  }
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 초기화버튼 클릭 이벤트
async function onClickReset() {
  searchParams.value.conStrtDt = `${now.format('YYYYMM')}01`; /* 변경일자(시작일자) */
  searchParams.value.conEndDt = now.format('YYYYMMDD'); /* 변경일자(종료일자) */
  searchParams.value.cstRelTpCd = '103'; /* 변경대상자구분 */
  searchParams.value.cstNo = ''; /* 고객번호 */
  searchParams.value.cntrNo = ''; /* 계약번호 */
  searchParams.value.cntrSn = ''; /* 계약일련번호 */

  cachedParams = cloneDeep(searchParams.value);
}

/**
 * 저장버튼 클릭하는 경우
 */
async function onClickSave() {
  const view = grdMainRefChg.value.getView();
  const insertRows = gridUtil.getCheckedRowValues(view);
  if (insertRows.length === 0) {
    notify(t('MSG_ALT_SAV_SEL_DATA')); // 저장할 데이터를 선택하세요.
    return;
  }

  const saveParams = insertRows.map((row) => ({
    cstRelTpCd: searchParams.value.cstRelTpCd, // 변경구분(명의변경)
    cstNoSave: searchParams.value.cstNoSave, // 변경 고객번호
    cntrChRsonCd: searchParams.value.cntrChRsonCd, // 계약변경사유코드
    cntrChRsonNm: searchParams.value.cntrChRsonNm, /* 계약변경사유명 */
    cntrCstNo: row.cntrCstNo,
    cntrRelDtlCd: row.cntrRelDtlCd,
    cntrRelDtlNm: row.cntrRelDtlNm,
    cntrNo: row.cntrNo.substring(0, 12),
    cntrSn: row.cntrNo.substring(13),
    exemYn: searchParams.value.exemYn,
    cntrCstRelId: row.cntrCstRelId,
  }));

  if (!await frmMainRef.value.validate()) { return; }

  if (!await confirm(t('MSG_ALT_IS_SAV_DATA'))) return; // 저장하시겠습니다까?

  if (insertRows.length > 0) {
    try {
      await dataService.post('sms/wells/contract/contract/save-contract', saveParams);
      notify(t('MSG_ALT_SAVE_DATA'));
      await fetchData();
    } catch (e) {
      await fetchData();
    }
  }
  notify(t('MSG_ALT_RGSTD'));
}

/**
 * 그리드
 */
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrCnfmDtm' },
    { fieldName: 'cntrCstNo' },
    { fieldName: 'cntrCstNm' },
    { fieldName: 'pdNm' },
    { fieldName: 'cntrRelDtlNm' },
    { fieldName: 'cntrRelDtlCd' },
    { fieldName: 'cntrCstRelId' },
  ];

  const columns = [
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO', null, '계약번호'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_CNTR_DATE', null, '계약일자'), width: '150', datetimeFormat: 'date', styleName: 'text-center' },
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO', null, '고객번호'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrCstNm', header: t('MSG_TXT_CST_NM', null, '고객명'), width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM', null, '상품명'), width: '100', styleName: 'text-left' },
    { fieldName: 'cntrRelDtlNm', header: t('MSG_TXT_CNTR_REL_DTL_NM', null, '계약관계상세명'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrRelDtlCd', header: t('MSG_TXT_CNTR_REL_DTL_NM', null, '계약관계상세코드'), width: '100', styleName: 'text-center', visible: false },
    { fieldName: 'cntrCstRelId', header: t('MSG_TXT_UNIQUE_NUM', null, '고유번호'), width: '120', styleName: 'text-center', visible: true },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
}

</script>
