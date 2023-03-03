<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : BNC
2. 프로그램 ID : WwbncBondCounselMCustomerSearch - 고객찾기 탭 - W-BN-U-0127M01
3. 작성자 : songmi.in
4. 작성일 : 2023.02.23 ~
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 채권상담 고객찾기 탭
****************************************************************************************************
--->
<template>
  <kw-search
    :cols="4"
    @search="onClickSearch"
  >
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_CLCTAM_NO')"
        required
      >
        <kw-input
          v-model="searchParams.clctamPrtnrNo"
          :label="$t('MSG_TXT_CLCTAM_NO')"
          :regex="/^[0-9]*$/i"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NM')"
        required
      >
        <kw-input
          v-model="searchParams.cstKnm"
          icon="search"
          clearable
          rules="required"
          :label="$t('MSG_TXT_CST_NM')"
          @click-icon="onClickSelectCustomer"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_MPNO')"
        required
      >
        <kw-input
          v-model="mpNo"
          :maxlength="11"
          :label="$t('MSG_TXT_MPNO')"
          :regex="/^[0-9]*$/i"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
          rules="required"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_IST_MPNO')"
      >
        <kw-input
          v-model="istMpNo"
          :maxlength="11"
          :regex="/^[0-9]*$/i"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_BND_PRP')"
      >
        <kw-select
          v-model="searchParams.bndClctnPrpDvCd"
          :options="codes.BND_CLCTN_PRP_DV_CD"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_PRP_RSON')"
      >
        <kw-select
          v-model="searchParams.bndClctnPrpRsonCd"
          :options="codes.BND_CLCTN_PRP_RSON_CD"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_TEL_NO')"
      >
        <kw-input
          v-model="telNo"
          :maxlength="11"
          :regex="/^[0-9]*$/i"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_IST_TNO')"
      >
        <kw-input
          v-model="istTelNo"
          :maxlength="11"
          :regex="/^[0-9]*$/i"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_ADDR')"
      >
        <kw-input v-model="searchParams.adr" />
      </kw-search-item>
    </kw-search-row>
  </kw-search>
  <div class="result-area">
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="totalCount"
        />
      </template>

      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="totalCount === 0"
        @click="onClickExcelDownload"
      />
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      name="grdMain"
      :visible-rows="10"
      @init="initGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, codeUtil, modal, gridUtil } from 'kw-lib';

const { t } = useI18n();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = ref({
  bndClctnPrpDvCd: '',
  bndClctnPrpRsonCd: '',
  clctamPrtnrNo: '',
  cstKnm: '',
  cntrCralLocaraTno: '',
  cntrMexnoEncr: '',
  cntrCralIdvTno: '',
  istCralLocaraTno: '',
  istMexnoEncr: '',
  istCralIdvTno: '',
  istLocaraTno: '',
  istExnoEncr: '',
  istIdvTno: '',
  cntrLocaraTno: '',
  cntrExnoEncr: '',
  cntrIdvTno: '',
  adr: '',
  cstNo: '',
});

const mpNo = ref('');
const istMpNo = ref('');
const telNo = ref('');
const istTelNo = ref('');
const totalCount = ref(0);

const codes = await codeUtil.getMultiCodes(
  'BND_CLCTN_PRP_DV_CD',
  'BND_CLCTN_PRP_RSON_CD',
);

function phoneFormat(type, phoneNumber) {
  const value = phoneNumber.replace(/[^0-9]/g, '');
  const firstLength = value.length > 9 ? 3 : 2;
  if (type === 'mpNo') {
    searchParams.value.cntrCralLocaraTno = value.slice(0, firstLength);
    searchParams.value.cntrMexnoEncr = value.slice(firstLength, value.length - 4);
    searchParams.value.cntrCralIdvTno = value.slice(value.length - 4);
  } else if (type === 'istMpNo') {
    searchParams.value.istCralLocaraTno = value.slice(0, firstLength);
    searchParams.value.istMexnoEncr = value.slice(firstLength, value.length - 4);
    searchParams.value.istCralIdvTno = value.slice(value.length - 4);
  } else if (type === 'telNo') {
    searchParams.value.cntrLocaraTno = value.slice(0, firstLength);
    searchParams.value.cntrExnoEncr = value.slice(firstLength, value.length - 4);
    searchParams.value.cntrIdvTno = value.slice(value.length - 4);
  } else {
    searchParams.value.istLocaraTno = value.slice(0, firstLength);
    searchParams.value.istExnoEncr = value.slice(firstLength, value.length - 4);
    searchParams.value.istIdvTno = value.slice(value.length - 4);
  }
}

watch(mpNo, (newVal) => {
  phoneFormat('mpNo', newVal);
});

watch(istMpNo, (newVal) => {
  phoneFormat('istMpNo', newVal);
});

watch(telNo, (newVal) => {
  phoneFormat('telNo', newVal);
});

watch(istTelNo, (newVal) => {
  phoneFormat('istTelNo', newVal);
});

async function fetchData() {
  const res = await dataService.get('/sms/wells/bond/customer-search', { params: searchParams.value });
  const customerList = res.data;
  totalCount.value = customerList.length;
  const view = grdMainRef.value.getView();

  /* TODO: 테이블 데이터 없음, 하드코딩 제거 대상 */
  if (customerList.length === 0) {
    const data = grdMainRef.value.getData();
    data.setRows([
      { bndBizDvCd: 'L10', bndBizDvNm: 'Wells', cntrNo: '12345621', cntrSn: '12', cstKnm: '윤경숙', prtnrKnm: '이소정', clctamPrtnrNo: '123549875', cstNo: '8956210254', sppZip: '02314', sppAdr: '서울특별시 중구', sppDtlAdr: '21', adr: '서울특별시 중구 21', cntrLocaraTno: '031', cntrExnoEncr: '6821', cntrIdvTno: '1254', cntrCralLocaraTno: '010', cntrMexnoEncr: '4562', cntrCralIdvTno: '1234', istLocaraTno: '031', istExnoEncr: '6821', istIdvTno: '1254', istCralLocaraTno: '010', istMexnoEncr: '4562', istCralIdvTno: '1234', sfkVal: '1234597', bndClctnPrpDvCd: '01', bndClctnPrpDvNm: '정상', bndClctnPrpRsonDvCd: '10', bndClctnPrpRsonDvNm: '정상' },
      { bndBizDvCd: 'L20', bndBizDvNm: '렌탈', cntrNo: '25402458', cntrSn: '02', cstKnm: '윤경숙', prtnrKnm: '이소정', clctamPrtnrNo: '567891562', cstNo: '8956210254', sppZip: '65424', sppAdr: '경기도 성남시', sppDtlAdr: '02', adr: '경기도 성남시 20', cntrLocaraTno: '02', cntrExnoEncr: '6821', cntrIdvTno: '1254', cntrCralLocaraTno: '010', cntrMexnoEncr: '4562', cntrCralIdvTno: '1234', istLocaraTno: '031', istExnoEncr: '5623', istIdvTno: '0021', istCralLocaraTno: '010', istMexnoEncr: '2650', istCralIdvTno: '5442', sfkVal: '564202', bndClctnPrpDvCd: '03', bndClctnPrpDvNm: '아웃소싱이관', bndClctnPrpRsonDvCd: '34', bndClctnPrpRsonDvNm: '사회약자' },
    ]);
    totalCount.value = '2';
  } else {
    view.getDataSource().setRows(customerList);
    view.resetCurrent();
  }
}

async function onClickSearch() {
  await fetchData();
}

/** 고객조회(공통) */
async function onClickSelectCustomer() {
  let returnCustomInfo = await modal({
    component: 'ZwcsaCustomerListP',
  });
  /* 단위 테스트를 위한 코딩 추후 고객조회(공통) 팝업이 완성되면 삭제 예정 */
  returnCustomInfo = {
    cstNo: '8956210254',
    cstNm: '윤경숙',
  };

  if (returnCustomInfo) {
    searchParams.value.cstNo = returnCustomInfo.cstNo;
    searchParams.value.cstKnm = returnCustomInfo.cstNm;
  }
}

async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: 'customerList',
    timePostfix: true,
  });
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'bndBizDvCd' },
    { fieldName: 'bndBizDvNm' },
    { fieldName: 'cntrNoSn' },
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cstKnm' },
    { fieldName: 'clctamPrtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'cntrTelNo' },
    { fieldName: 'cntrMpNo' },
    { fieldName: 'cstNo' },
    { fieldName: 'sppAdr' },
    { fieldName: 'istTelNo' },
    { fieldName: 'istMpNo' },
    { fieldName: 'bndClctnPrpDvNm' },
    { fieldName: 'bndClctnPrpRsonDvNm' },
    { fieldName: 'sppZip' },
    { fieldName: 'sppDtlAdr' },
    { fieldName: 'adr' },
    { fieldName: 'cntrLocaraTno' },
    { fieldName: 'cntrExnoEncr' },
    { fieldName: 'cntrIdvTno' },
    { fieldName: 'cntrCralLocaraTno' },
    { fieldName: 'cntrMexnoEncr' },
    { fieldName: 'cntrCralIdvTno' },
    { fieldName: 'istLocaraTno' },
    { fieldName: 'istExnoEncr' },
    { fieldName: 'istIdvTno' },
    { fieldName: 'istCralLocaraTno' },
    { fieldName: 'istMexnoEncr' },
    { fieldName: 'istCralIdvTno' },
    { fieldName: 'sfkVal' },
    { fieldName: 'bndClctnPrpDvCd' },
    { fieldName: 'bndClctnPrpRsonCd' },
  ];

  const columns = [
    { fieldName: 'bndBizDvCd', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'bndBizDvNm', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-left' },
    {
      fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_NO'),
      styleName: 'text-left',
      width: '100',

      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}${cntrSn}`;
      },
    },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_ICHR_NO'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_ICHR'), width: '100', styleName: 'text-left' },
    {
      fieldName: 'cntrTelNo',
      header: t('MSG_TXT_TEL_NO'),
      styleName: 'text-left',
      width: '100',

      displayCallback(grid, index) {
        const { cntrLocaraTno: no1, cntrExnoEncr: no2, cntrIdvTno: no3 } = grid.getValues(index.itemIndex);
        return `${no1}-${no2}-${no3}`;
      },
    },
    {
      fieldName: 'cntrMpNo',
      header: t('MSG_TXT_MPNO'),
      styleName: 'text-left',
      width: '100',

      displayCallback(grid, index) {
        const { cntrCralLocaraTno: no1, cntrMexnoEncr: no2, cntrCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        return `${no1}-${no2}-${no3}`;
      },
    },
    { fieldName: 'cstNo', header: t('MSG_TXT_KWK'), width: '100', styleName: 'text-left' },
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '100', styleName: 'text-left' },
    { fieldName: 'sppAdr', header: t('MSG_TXT_ADDR'), width: '100', styleName: 'text-left', visible: false },
    {
      fieldName: 'istTelNo',
      header: t('MSG_TXT_IST_TNO'),
      styleName: 'text-left',
      width: '100',

      displayCallback(grid, index) {
        const { istLocaraTno: no1, istExnoEncr: no2, istIdvTno: no3 } = grid.getValues(index.itemIndex);
        return `${no1}-${no2}-${no3}`;
      },
    },
    {
      fieldName: 'istMpNo',
      header: t('MSG_TXT_IST_MPNO'),
      styleName: 'text-left',
      width: '100',

      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        return `${no1}-${no2}-${no3}`;
      },
    },
    { fieldName: 'bndClctnPrpDvNm', header: t('MSG_TXT_BND_PRP'), width: '100', styleName: 'text-left' },
    { fieldName: 'bndClctnPrpRsonDvNm', header: t('MSG_TXT_PRP_RSON'), width: '100', styleName: 'text-left' },
    { fieldName: 'sppZip', header: t('MSG_TXT_CNTR_ZIP'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'sppDtlAdr', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrLocaraTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrExnoEncr', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrIdvTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrCralLocaraTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrMexnoEncr', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'cntrCralIdvTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'istLocaraTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'istExnoEncr', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'istIdvTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'istCralLocaraTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'istMexnoEncr', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'istCralIdvTno', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'sfkVal', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'bndClctnPrpDvCd', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
    { fieldName: 'bndClctnPrpRsonCd', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-left', visible: false },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
}
</script>
