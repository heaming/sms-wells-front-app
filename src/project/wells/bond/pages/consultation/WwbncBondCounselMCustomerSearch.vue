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
        :label="$t('MSG_TXT_CLCTAM_ICHR_EMPNO')"
      >
        <kw-input
          v-model="searchParams.clctamPrtnrNo"
          :label="$t('MSG_TXT_CLCTAM_ICHR_EMPNO')"
          regex="num"
          :maxlength="10"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_CST_NM')"
      >
        <kw-input
          v-model="searchParams.cstKnm"
          icon="search"
          regex="alpha_hangul"
          maxlength="30"
          clearable
          :label="$t('MSG_TXT_CST_NM')"
          @change="onChangeCstKnm"
          @click-icon="onClickSelectCustomer"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_MPNO')"
      >
        <kw-input
          v-model="searchParams.cellphone"
          v-model:tel-no0="searchParams.cntrCralLocaraTno"
          v-model:tel-no1="searchParams.cntrMexnoEncr"
          v-model:tel-no2="searchParams.cntrCralIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
          :label="$t('MSG_TXT_MPNO')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_IST_MPNO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.istCralLocaraTno"
          v-model:tel-no1="searchParams.istMexnoEncr"
          v-model:tel-no2="searchParams.istCralIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :colspan="2"
        :label="$t('MSG_TXT_BND_PRP_RSON')"
      >
        <kw-select
          v-model="searchParams.bndClctnPrpDvCd"
          :options="codes.BND_CLCTN_PRP_DV_CD"
          first-option="all"
        />
        <kw-select
          v-model="searchParams.bndClctnPrpRsonCd"
          :options="subModuleCodes"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_TEL_NO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.cntrLocaraTno"
          v-model:tel-no1="searchParams.cntrExnoEncr"
          v-model:tel-no2="searchParams.cntrIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
      <kw-search-item
        :label="$t('MSG_TXT_IST_TNO')"
      >
        <kw-input
          v-model:tel-no0="searchParams.istLocaraTno"
          v-model:tel-no1="searchParams.istExnoEncr"
          v-model:tel-no2="searchParams.istIdvTno"
          mask="telephone"
          :placeholder="$t('MSG_TXT_REPSN_DGT4_WO_NO_IN')"
        />
      </kw-search-item>
    </kw-search-row>
    <kw-search-row>
      <kw-search-item
        :label="$t('MSG_TXT_ADDR')"
      >
        <kw-input
          v-model="searchParams.adr"
          maxlength="180"
        />
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
        v-permission:download
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
      @init="initGrid"
    />
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, codeUtil, modal, gridUtil, defineGrid, useGlobal, popupUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const { currentRoute } = useRouter();
const { alert } = useGlobal();
const { getters } = useStore();
const { employeeIDNumber } = getters['meta/getUserInfo'];

const props = defineProps({
  cellphone: {
    type: String,
    default: null,
  },
  searchYn: {
    type: String,
    default: 'N',
  },
});

const emit = defineEmits([
  'update:searchYn',
]);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const searchParams = reactive({ clctamPrtnrNo: employeeIDNumber });
const totalCount = ref(0);
const subModuleCodes = ref([]);
const customerParams = ref({});
const windowKey = ref('');

const codes = await codeUtil.getMultiCodes(
  'BND_CLCTN_PRP_DV_CD',
);

watch(() => searchParams.bndClctnPrpDvCd, async (newValue) => {
  searchParams.bndClctnPrpRsonCd = '';
  subModuleCodes.value = newValue !== '' ? await codeUtil.getSubCodes('BND_CLCTN_PRP_RSON_CD', newValue) : [];
}, { immediate: true });

// 고객명 변경 시
async function onChangeCstKnm() {
  searchParams.cstNo = '';
}

async function fetchData() {
  const res = await dataService.get('/sms/wells/bond/customer-search', { params: searchParams, timeout: 300000 });
  const customers = res.data;
  totalCount.value = customers.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(customers);
}

// 휴대전화번호 세팅
async function setCellphone(val) {
  searchParams.cntrCralLocaraTno = val?.split('-')[0];
  searchParams.cntrMexnoEncr = val?.split('-')[1];
  searchParams.cntrCralIdvTno = val?.split('-')[2];

  await fetchData();
  emit('update:searchYn', 'N');
}

watch(() => props.searchYn, async () => {
  if (props.searchYn === 'Y') {
    searchParams.cellphone = props.cellphone;
    await setCellphone(searchParams.cellphone);
  }
}, { immediate: true });

// 조회 버튼
async function onClickSearch() {
  const notEmpty = Object.values(searchParams).some((val) => !isEmpty(val));
  if (!notEmpty) {
    return await alert(t('MSG_ALT_INQR_CNDT_AT_LEAST_ONE'));
  }

  await fetchData();
}

// 고객명 돋보기 버튼
async function onClickSelectCustomer() {
  const { result, payload } = await modal({
    component: 'ZwbnyDelinquentCustomerP',
    componentProps: {
      baseYm: customerParams.value.baseYm,
      cstNm: searchParams.cstKnm,
    },
  });
  if (result) {
    const { cstNo, cstNm } = payload;
    searchParams.cstNo = cstNo;
    searchParams.cstKnm = cstNm;
  }
}

// 엑셀 다운로드 버튼
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    exportData: gridUtil.getAllRowValues(view),
  });
}

// 기준년월 조회
async function fetchBaseYmData() {
  const response = await dataService.get('/sms/common/bond/promise-customer/base-ym');
  customerParams.value = response.data;
}

onMounted(async () => {
  await fetchBaseYmData();
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrid = defineGrid((data, view) => {
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
    { fieldName: 'istTelNo' },
    { fieldName: 'istMpNo' },
    { fieldName: 'bndClctnPrpDvNm' },
    { fieldName: 'bndClctnPrpRsonDvNm' },
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
    { fieldName: 'bndBizDvCd', header: t('MSG_TXT_BND_BIZ_DV_CD'), width: '100', styleName: 'text-center', visible: false }, // 채권업무구분코드
    { fieldName: 'bndBizDvNm', header: t('MSG_TXT_DIV'), width: '100', styleName: 'text-center' }, // 구분
    {
      fieldName: 'cntrNoSn', // 계약상세번호
      header: t('MSG_TXT_CNTR_DTL_NO'),
      styleName: 'text-center',
      width: '150',

      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '100', styleName: 'text-center', visible: false }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_CNTR_SN'), width: '100', styleName: 'text-center', visible: false }, // 계약일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'clctamPrtnrNo', header: t('MSG_TXT_CLCTAM_PRTNR_NO2'), width: '100', styleName: 'text-center', visible: false }, // 집금파트너번호
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_CLCTAM_PSIC'), width: '100', styleName: 'text-center' }, // 집금담당자
    {
      fieldName: 'cntrTelNo', // 전화번호
      header: t('MSG_TXT_TEL_NO'),
      styleName: 'text-center',
      width: '140',

      displayCallback(grid, index) {
        const { cntrLocaraTno: no1, cntrExnoEncr: no2, cntrIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1)) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    {
      fieldName: 'cntrMpNo', // 휴대전화번호
      header: t('MSG_TXT_MPNO'),
      styleName: 'text-center',
      width: '140',

      displayCallback(grid, index) {
        const { cntrCralLocaraTno: no1, cntrMexnoEncr: no2, cntrCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1)) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'cstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' }, // 고객번호
    { fieldName: 'adr', header: t('MSG_TXT_ADDR'), width: '100', styleName: 'text-left' }, // 주소
    {
      fieldName: 'istTelNo', // 설치전화번호
      header: t('MSG_TXT_IST_TNO'),
      styleName: 'text-center',
      width: '140',

      displayCallback(grid, index) {
        const { istLocaraTno: no1, istExnoEncr: no2, istIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1)) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    {
      fieldName: 'istMpNo', // 설치휴대전화번호
      header: t('MSG_TXT_IST_MPNO'),
      styleName: 'text-center',
      width: '140',

      displayCallback(grid, index) {
        const { istCralLocaraTno: no1, istMexnoEncr: no2, istCralIdvTno: no3 } = grid.getValues(index.itemIndex);
        if (!isEmpty(no1)) {
          return `${no1}-${no2}-${no3}`;
        }
      },
    },
    { fieldName: 'bndClctnPrpDvNm', header: t('MSG_TXT_BND_PRP'), width: '100', styleName: 'text-center' }, // 채권속성
    { fieldName: 'bndClctnPrpRsonDvNm', header: t('MSG_TXT_PRP_RSON'), width: '100', styleName: 'text-center' }, // 속성사유
    { fieldName: 'cntrLocaraTno', header: t('MSG_TXT_CNTR_LOCARA_TNO'), width: '100', styleName: 'text-left', visible: false }, // 계약처지역전화번호
    { fieldName: 'cntrExnoEncr', header: t('MSG_TXT_CNTR_EXNO_ENCR'), width: '100', styleName: 'text-left', visible: false }, // 계약처전화국번호암호화
    { fieldName: 'cntrIdvTno', header: t('MSG_TXT_CNTR_IDV_TNO'), width: '100', styleName: 'text-left', visible: false }, // 계약처개별전화번호
    { fieldName: 'cntrCralLocaraTno', header: t('MSG_TXT_CNTR_CRAL_LOCARA_TNO'), width: '100', styleName: 'text-left', visible: false }, // 계약처휴대지역전화번호
    { fieldName: 'cntrMexnoEncr', header: t('MSG_TXT_CNTR_CRAL_EXNO_ENCR'), width: '100', styleName: 'text-left', visible: false }, // 계약처휴대전화국번호암호화
    { fieldName: 'cntrCralIdvTno', header: t('MSG_TXT_CNTR_CRAL_IDV_TNO'), width: '100', styleName: 'text-left', visible: false }, // 계약처휴대개별전화번호
    { fieldName: 'istLocaraTno', header: t('MSG_TXT_IST_LOCARA_TNO'), width: '100', styleName: 'text-left', visible: false }, // 설치처지역전화번호
    { fieldName: 'istExnoEncr', header: t('MSG_TXT_IST_EXNO_ENCR'), width: '100', styleName: 'text-left', visible: false }, // 설치처전화국번호암호화
    { fieldName: 'istIdvTno', header: t('MSG_TXT_IST_IDV_TNO'), width: '100', styleName: 'text-left', visible: false }, // 설치처개별전화번호
    { fieldName: 'istCralLocaraTno', header: t('MSG_TXT_IST_CRAL_LOCARA_TNO'), width: '100', styleName: 'text-left', visible: false }, // 설치처휴대지역전화번호
    { fieldName: 'istMexnoEncr', header: t('MSG_TXT_IST_CRAL_EXNO_ENCR'), width: '100', styleName: 'text-left', visible: false }, // 설치처휴대전화국번호암호화
    { fieldName: 'istCralIdvTno', header: t('MSG_TXT_IST_CRAL_IDV_TNO'), width: '100', styleName: 'text-left', visible: false }, // 설치처휴대개별전화번호
    { fieldName: 'sfkVal', header: t('MSG_TXT_SFK_VAL'), width: '100', styleName: 'text-left', visible: false }, // 세이프키값
    { fieldName: 'bndClctnPrpDvCd', header: t('MSG_TXT_BND_CLCTN_PRP_DV_CD'), width: '100', styleName: 'text-left', visible: false }, // 채권추심속성구분코드
    { fieldName: 'bndClctnPrpRsonCd', header: t('MSG_TXT_BND_CLCTN_PRP_RSON_CD'), width: '100', styleName: 'text-left', visible: false }, // 채권추심속성사유코드
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  view.onCellDblClicked = async (g, { dataRow }) => {
    const { cstNo, cntrNo, cntrSn } = gridUtil.getRowValue(g, dataRow);

    windowKey.value = `WwbncBondCounselMCustomerSearch_${cstNo}`;
    if (cstNo) {
      await popupUtil.open(`/popup/#/wwbnc-customer-dtl?cstNo=${cstNo}&cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, { 'modal-popup': true, cstNo, cntrNo, cntrSn }, windowKey.value);
    }
  };
});
</script>
