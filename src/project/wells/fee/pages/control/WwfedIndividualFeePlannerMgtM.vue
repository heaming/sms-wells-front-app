<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FED
2. 프로그램 ID : WwfedIndividualFeePlannerMgtM - 개인별 수수료 관리(P조직)
3. 작성자 : min-kyu bae
4. 작성일 : 2023.03.02
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인별 수수료 관리(P조직) 조회 화면
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            v-model="searchParams.perfYm"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
            rules="required"
          />
        </kw-search-item>

        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            v-model="searchParams.no"
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            :maxlength="10"
            :on-click-icon="onClickSearchNo"
            :placeholder="$t('MSG_TXT_SEQUENCE_NUMBER')"
            rules="required"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            :placeholder="$t('MSG_TXT_EMPL_NM')"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ t('MSG_TIT_BIZ_INFO') }}</h3>
      <kw-form
        class="mt20"
        dense
        align-content="left"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_EMPL_NM')"
            align-content="left"
          >
            <p>{{ info1.emplNm }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>{{ info1.blg }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSB')"
            align-content="left"
          >
            <p>{{ info1.rsb }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_METG')"
            align-content="right"
          >
            <p>{{ info1.metg ?stringUtil.getNumberWithComma(info1.metg) : '0' }}</p>
          </kw-form-item>
          <kw-form-item />
          <kw-form-item
            :label="t('MSG_TXT_QLF')"
            align-content="left"
          >
            <p>{{ info1.qlf }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_BAS_IZ') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_COLON_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grd1MainRef"
        name="grd1Main"
        :visible-rows="2"
        @init="initGrd1Main"
      />
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_TOT_SUM') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item :label="t('MSG_TXT_INTBS_SUM')">
            <p>{{ info1.intbsSum ? stringUtil.getNumberWithComma(info1.intbsSum) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_DDTN_SUM')">
            <p>{{ info1.ddtnSum ? stringUtil.getNumberWithComma(info1.ddtnSum) : '0' }}</p>
          </kw-form-item>
          <kw-form-item :label="t('MSG_TXT_ACL_DSB_AMT')">
            <p>{{ info1.aclDsbAmt ? stringUtil.getNumberWithComma(info1.aclDsbAmt) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_FEE_IZ') }}</h3>
          <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_FEE_CTR')"
          :disable="!isBtnClick"
          @click="openFeeControlPopup"
        />
      </kw-action-top>
      <kw-grid
        ref="grd2MainRef"
        name="grd2Main"
        :visible-rows="7"
        @init="initGrd2Main"
      />
      <kw-separator />
      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_DDTN_IZ') }}</h3>
          <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        </template>
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_BU_DDTN')+t('MSG_BTN_CTR')"
          :disable="!isBtnClick"
          @click="openZwfedFeeBurdenDeductionRegP"
        />
        <kw-separator
          spaced
          vertical
          inset
        />
        <kw-btn
          dense
          secondary
          :label="t('MSG_BTN_PNPYAM')+t('MSG_BTN_CTR')"
          :disable="!isBtnClick"
          @click="openZwfedFeePnpyamDeductionRegP"
        />
      </kw-action-top>
      <kw-form
        dense
        align-content="right"
      >
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_RDS')"
          >
            <p>{{ info2.rds ? stringUtil.getNumberWithComma(info2.rds) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_ERNTX')"
          >
            <p>{{ info2.erntx ? stringUtil.getNumberWithComma(info2.erntx) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_RSDNTX')"
          >
            <p>{{ info2.rsdntx ? stringUtil.getNumberWithComma(info2.rsdntx) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_HIR_INSR')"
          >
            <p>{{ info2.hirInsr ? stringUtil.getNumberWithComma(info2.hirInsr) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_BU_DDTN')"
          >
            <p>{{ info2.buDdtn ? stringUtil.getNumberWithComma(info2.buDdtn) : '0' }}</p>
          </kw-form-item>
          <kw-form-item
            :label="t('MSG_TXT_PNPYAM')"
          >
            <p>{{ info2.pnpyam ? stringUtil.getNumberWithComma(info2.pnpyam) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="t('MSG_TXT_INDD_INSR')"
          >
            <p>{{ info2.pnpyam ? stringUtil.getNumberWithComma(info2.inddInsr) : '0' }}</p>
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <kw-action-top class="mb20">
        <template #left>
          <h3>{{ t('MSG_TXT_CTR_IZ') }}</h3>
        </template>
        <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
      </kw-action-top>
      <kw-grid
        ref="grd3MainRef"
        name="grd3Main"
        :visible-rows="3"
        @init="initGrd3Main"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, getComponentType, stringUtil, modal, defineGrid } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();
const isBtnClick = ref(false);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const now = dayjs();
const grd1MainRef = ref(getComponentType('KwGrid'));
const grd2MainRef = ref(getComponentType('KwGrid'));
const grd3MainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);
const searchParams = ref({

  perfYm: now.add(-1, 'month').format('YYYYMM'),
  no: '',
  prtnrKnm: '',

});

const info1 = ref({
  emplNm: '',
  blg: '',
  rsb: '',
  metg: '',
  qlf: '',
  intbsSum: '',
  ddtnSum: '',
  aclDsbAmt: '',
});

const info2 = ref({
  rds: '',
  erntx: '',
  rsdntx: '',
  hirInsr: '',
  buDdtn: '',
  pnpyam: '',
  inddInsr: '',
});

let cachedParams;

/*
 *  Event - 수수료조정 버튼 클릭
 */
async function openFeeControlPopup() {
  const param = {
    perfYm: searchParams.value.perfYm,
    prtnrNo: searchParams.value.no,
    ogTpCd: 'W01',
  };

  await modal({
    component: 'ZwfedFeeControlP',
    componentProps: param,
  });
}

/*
 *  Event - 번호 검색 아이콘 클릭 이벤트
 */
async function onClickSearchNo() {
  const { result, payload } = await modal({
    component: 'ZwogzMonthPartnerListP',
    componentProps: {
      baseYm: searchParams.value.perfYm,
      prtnrNo: searchParams.value.no,
      ogTpCd: 'W01',
      prtnrKnm: undefined,
    },
  });

  if (result) {
    if (!isEmpty(payload)) {
      searchParams.value.no = payload.prtnrNo;
      searchParams.value.prtnrKnm = payload.prtnrKnm;
    }
  }
}

/*
 *  Event - 이체자료 생성 후 조정 못하게 막음
 */
async function getUseYn(perfYm, ogTpCd, prtnrNo) {
  const type = 'DML';
  const res = await dataService.get(`sms/common/fee/schedules/use-control/${perfYm}-${ogTpCd}-${prtnrNo}-${type}`);

  if (res.data === 'Y') {
    isBtnClick.value = true;
  } else {
    isBtnClick.value = false;
  }
}

async function fetchData(type) {
  const response = await dataService.get(`/sms/wells/fee/individual-fee/plar-${type}`, { params: cachedParams, timeout: 300000 });
  const resData = response.data;
  totalCount.value = resData.length;
  if (type === 'entrepreneur') {
    info1.value = resData;
    if (info1.value.emplNm !== undefined) {
      isBtnClick.value = true;
    } else {
      isBtnClick.value = false;
      searchParams.value.prtnrKnm = '';
    }
  } else if (type === 'basic') {
    const basicView = grd1MainRef.value.getView();
    basicView.getDataSource().setRows(resData);
  } else if (type === 'fee') {
    const feeView = grd2MainRef.value.getView();
    feeView.getDataSource().setRows(resData);
  } else if (type === 'deduction') {
    info2.value = resData;
  } else if (type === 'control') {
    const controlView = grd3MainRef.value.getView();
    controlView.getDataSource().setRows(resData);
  }
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData('entrepreneur');
  if (isBtnClick.value === true) {
    await fetchData('basic');
    await fetchData('fee');
    await fetchData('deduction');
    await fetchData('control');
    await getUseYn(searchParams.value.perfYm, 'W01', searchParams.value.no);
  }
}

/*
 *  Event - 부담공제조정 버튼 클릭
 */
async function openZwfedFeeBurdenDeductionRegP() {
  const { perfYm, no } = searchParams.value;
  const param = {
    ddtnYm: perfYm,
    coCd: '2000',
    ogTpCd: 'W01',
    prtnrNo: no,
  };
  await modal({
    component: 'ZwfedFeeBurdenDeductionRegP',
    componentProps: param,
  });
}
/*
 *  Event - 가지급금조정 버튼 클릭
 */
async function openZwfedFeePnpyamDeductionRegP() {
  const param = {
    ddtnYm: searchParams.value.perfYm,
    coCd: '2000',
    ogTpCd: 'W01',
    prtnrNo: searchParams.value.no,
  };
  const { result: isChanged } = await modal({
    component: 'ZwfedFeePnpyamDeductionRegP',
    componentProps: param,
  });
  if (isChanged) {
    onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrd1Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item1' },
    { fieldName: 'fval1', dataType: 'number' },
    { fieldName: 'item2' },
    { fieldName: 'fval2', dataType: 'number' },
    { fieldName: 'item3' },
    { fieldName: 'fval3', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '개인합계', styleName: 'text-left' } },
    { fieldName: 'fval1', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '조직합계', styleName: 'text-left' } },
    { fieldName: 'fval2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item3', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '기타합계', styleName: 'text-left' } },
    { fieldName: 'fval3', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setFooters({ visible: true, items: [{ height: 42 }] });

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'fval1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item2', 'fval2'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item3', 'fval3'],
      hideChildHeaders: true,
    },

  ]);
});

const initGrd2Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'item1' },
    { fieldName: 'fval1', dataType: 'number' },
    { fieldName: 'item2' },
    { fieldName: 'fval2', dataType: 'number' },
    { fieldName: 'item3' },
    { fieldName: 'fval3', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'item1', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '개인합계', styleName: 'text-left' } },
    { fieldName: 'fval1', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item2', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '조직합계', styleName: 'text-left' } },
    { fieldName: 'fval2', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },
    { fieldName: 'item3', header: t('MSG_TXT_ITEM'), width: '194', styleName: 'text-left', footer: { text: '기타합계', styleName: 'text-left' } },
    { fieldName: 'fval3', header: t('MSG_TXT_AMT'), width: '203', styleName: 'text-right', footer: { expression: 'sum', numberFormat: '#,##0', styleName: 'text-right' } },

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  view.setFooters({ visible: true, items: [{ height: 42 }] });

  // multi row header setting
  view.setColumnLayout([

    {
      header: t('MSG_TXT_INDV') + t('MSG_TXT_FEE'), // colspan title
      direction: 'horizontal', // merge type
      items: ['item1', 'fval1'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_OG') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item2', 'fval2'],
      hideChildHeaders: true,
    },
    {
      header: t('MSG_TXT_ETC') + t('MSG_TXT_FEE'),
      direction: 'horizontal',
      items: ['item3', 'fval3'],
      hideChildHeaders: true,
    },

  ]);
});

const initGrd3Main = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'div' },
    { fieldName: 'item' },
    { fieldName: 'ctrBf', dataType: 'number' },
    { fieldName: 'ctrAf', dataType: 'number' },
    { fieldName: 'rsn' },
    { fieldName: 'ctrDtm' },
    { fieldName: 'ctrr' },
  ];

  const columns = [
    { fieldName: 'div', header: t('MSG_TXT_DIV'), width: '132', styleName: 'text-left' },
    { fieldName: 'item', header: t('MSG_TXT_ITEM'), width: '247', styleName: 'text-left' },
    { fieldName: 'ctrBf', header: t('MSG_TXT_CTR_BF'), width: '200', styleName: 'text-right' },
    { fieldName: 'ctrAf', header: t('MSG_TXT_CTR_AF'), width: '200', styleName: 'text-right' },
    { fieldName: 'rsn', header: t('MSG_TXT_RSN'), width: '328', styleName: 'text-left' },
    { fieldName: 'ctrDtm', header: t('MSG_TXT_CTR_DTM'), width: '200', styleName: 'text-center' },
    { fieldName: 'ctrr', header: t('MSG_TXT_CTRR'), width: '161', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
});

</script>
