<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfActivityGoodsMgtM - 활동물품관리
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="result-area">
      <kw-list
        separator
        item-padding="10px 0px 0px"
      >
        <kw-expansion-item
          group="list-group"
          padding-target="header"
          expansion-icon-align="center"
          expand-icon-class="kw-font-pt24"
        >
          <template #header>
            <kw-item-section>
              <kw-item-label>
                <span class="text-bold kw-font-pt18">유니폼신청 기준정보</span>
                <div class="float-right">
                  <kw-btn
                    v-if="isTopBtn"
                    :label="t('MSG_TXT_UPRC_MNGT')"
                    dense
                    class="mr8"
                    @click="onClickUnitPrice"
                  />
                  <kw-btn
                    v-if="isTopBtn"
                    :label="t('MSG_TXT_SZ_MNGT')"
                    dense
                    @click="onClickSize"
                  />
                </div>
              </kw-item-label>
            </kw-item-section>
          </template>
          <div class="mt10">
            <kw-form
              ref="frmMainRef"
              :cols="2"
            >
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_OG_TP')"
                  required
                >
                  <kw-option-group
                    v-model="frmMainData.ogTpCd"
                    :label="t('MSG_TXT_OG_TP')"
                    type="radio"
                    :options="ogTpCds"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_APLC_PRD')"
                >
                  <kw-input
                    v-model="frmMainData.aplcPsbStrtD"
                    regex="num"
                    maxlength="2"
                    :label="$t('MSG_TXT_APLC_PRD')"
                    rules="numeric|max_value:31"
                  />
                  <span>~</span>
                  <kw-input
                    v-model="frmMainData.aplcPsbEndD"
                    regex="num"
                    maxlength="2"
                    :label="$t('MSG_TXT_APLC_PRD')"
                    rules="numeric|max_value:31"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_RTNGD_PTRM')"
                >
                  <kw-input
                    v-model="frmMainData.rtngdPsbStrtD"
                    regex="num"
                    maxlength="2"
                    :label="$t('MSG_TXT_RTNGD_PTRM')"
                    rules="numeric|max_value:31"
                  />
                  <span>~</span>
                  <kw-input
                    v-model="frmMainData.rtngdPsbEndD"
                    regex="num"
                    maxlength="2"
                    :label="$t('MSG_TXT_RTNGD_PTRM')"
                    rules="numeric|max_value:31"
                  />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TIT_RETURN')"
                  colspan="2"
                >
                  <kw-input v-model="frmMainData.rtngdShrnEmadr" />
                </kw-form-item>
              </kw-form-row>
              <kw-form-row>
                <kw-form-item
                  :label="$t('MSG_TXT_NTCCN')"
                  colspan="2"
                >
                  <kw-input
                    v-model="frmMainData.confArtcCn"
                    type="textarea"
                    :rows="10"
                    placeholder="구입가격은 유니폼 신청월부터 3회(하복), 6회(동복) 분할 수당 공제되며 6개월, 12개월 후 50%씩 재지급합니다.
(재지급 기준 : 실활동 월 20계정 이상 완료)22.07월부터 월50계정이상완료변경
- 유니폼은 웰스매니저에 한하여 신청이 가능합니다. ( 웰스매니저 외 직급은 유니폼 업체로 개별 구매 요망 )

- 여자 신청 가능 사이즈 : 44, 55, 66, 77, 88, 99, 100, 105, 110, 115, 120
★여자 바지는 짝수사이즈만 신청 가능★이성 유니폼 신청 불가(여자 매니저가 남자 매니저 유니폼 신청 불가)★

- 남자 신청 가능 사이즈: 남자 : (하복만 90) 95, 100, 105, 110, 115, 120
★이성 유니폼 신청 불가(남자 매니저가 여자 매니저 유니폼 신청 불가)★"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </div>
          <kw-separator class="mt20 mb20" />
          <div class="text-right">
            <kw-btn
              :label="$t('MSG_BTN_SAVE')"
              primary
              default
              @click="onClickSave"
            />
          </div>
        </kw-expansion-item>
        <kw-separator class="mt20 mb0" />
      </kw-list>
    </div>
    <kw-search
      :cols="3"
      @search="onClickSearch"
    >
      <h3 class="mt0 pb20">
        {{ $t('MSG_TXT_UNIFORM_APP') }}
      </h3>
      <kw-search-row>
        <!-- 조직유형 -->
        <kw-search-item
          :label="t('MSG_TXT_OG_TP')"
          required
        >
          <kw-select
            v-model="searchParams.ogTpCd"
            :label="t('MSG_TXT_OG_TP')"
            rules="required"
            :options="ogTpCds"
            first-option="select"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_APL_DATE')"
        >
          <kw-date-picker
            v-model="searchParams.aplcDt"
            type="month"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_SEQUENCE_NUMBER')">
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            clearable
            @click-icon="onClickIcon"
          /><!--번호-->
          <!--성명-->
          <kw-input
            v-model="searchParams.prtnrKnm"
            readonly
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_INQR_DV')">
          <kw-option-group
            v-model="searchParams.actiStatCd"
            type="radio"
            :options="[{codeId:'01',codeName:t('MSG_TXT_APLC')},{codeId:'02',codeName:t('MSG_TXT_DDTN')}]"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_BLNGT_DV')"
        >
          <kw-option-group
            v-model="searchParams.bzStatCd"
            :label="$t('MSG_TXT_BLNGT_DV')"
            type="radio"
            :options="codes.BZ_STAT_CD"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
          <span class="ml8"> {{ $t('MSG_TXT_UNIT_WON') }} </span>
        </template>
        <kw-btn
          v-if="searchParams.actiStatCd == '01'"
          icon="upload_on"
          dense
          :label="$t('MSG_TXT_EXCEL_UPLOAD')"
          @click="onClickExcelUpload"
        />
        <kw-btn
          icon="download_on"
          dense
          :label="$t('MSG_BTN_EXCEL_DOWN')"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          v-if="isBtn && searchParams.actiStatCd == '01'"
          :label="$t('MSG_TXT_CHO_CAN')"
          dense
          @click="onClickCancel('02')"
        />
        <kw-btn
          v-if="isBtn && searchParams.actiStatCd == '01'"
          :label="$t('MSG_TXT_CHO_RTNGD')"
          dense
          @click="onClickCancel('03')"
        />

        <kw-btn
          v-if="isTopBtn && searchParams.actiStatCd == '02'"
          :label="$t('MSG_TXT_FEE_DED')"
          dense
          @click="onClickPopup()"
        />
        <kw-btn
          v-if="searchParams.actiStatCd == '02'"
          :label="$t('MSG_TXT_DDTN_CAN')"
          dense
          @click="onClickDelete()"
        />
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        name="grdMain"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        :visible-rows="10"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
      />
      <kw-separator />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, gridUtil, useGlobal, useDataService, useMeta, defineGrid, stringUtil } from 'kw-lib';
import { cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const { modal } = useGlobal();
const { getConfig, getUserInfo } = useMeta();
const { notify, confirm, alert } = useGlobal();
const { t } = useI18n();
const dataService = useDataService();
const now = dayjs();
const { currentRoute } = useRouter();
const userInfo = getUserInfo();
const { baseRleCd, ogTpCd } = userInfo;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

const ogTpCds = ref();
const codes = await codeUtil.getMultiCodes(
  'OG_TP_CD',
  'COD_PAGE_SIZE_OPTIONS',
  'BZ_STAT_CD', // 사업상태코드
);
ogTpCds.value = codes.OG_TP_CD.filter((v) => ['W02', 'W03'].includes(v.codeId));
const grdMainRef = ref(getComponentType('KwGrid'));
const frmMainData = ref({
  ogTpCd, /* 조직유형코드 */
  aplcPsbStrtD: '', /* 신청가능시작일 */
  aplcPsbEndD: '', /* 신청가능종료일 */
  rtngdPsbStrtD: '', /* 반품가능시작일 */
  rtngdPsbEndD: '', /* 반품가능종료일 */
  rtngdShrnEmadr: '', /* 반품공유이메일주소 */
  confArtcCn: '', /* 확인사항내용 */
});

const isTopBtn = ['W1010', 'W1580', 'W1560'].includes(baseRleCd); // 본사스텝

const isBtn = ['W1010', 'W1020', 'W1580', 'W1560'].includes(baseRleCd); // 본사스텝,업무담당

const searchParams = ref({
  ogTpCd: userInfo.ogTpCd, /* 조직유형코드 */
  aplcDt: now.format('YYYYMM'),
  actiStatCd: '01',
  prtnrNo: '',
  prtnrKnm: '',
  bzStatCd: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
watch(() => searchParams.value.ogTpCd, async (newVal) => {
  if (newVal !== '') {
    frmMainData.value.ogTpCd = newVal;
  }
});

watch(() => searchParams.value.actiStatCd, async (newVal) => {
  const view = grdMainRef.value.getView();
  if (newVal === '02') {
    view.columnByName('col5').visible = false;
    view.columnByName('startYrmn').visible = false;
    view.columnByName('baseDvNm').visible = false;
    view.columnByName('thmAmt').visible = true;
  } else {
    view.columnByName('col5').visible = true;
    view.columnByName('startYrmn').visible = true;
    view.columnByName('baseDvNm').visible = true;
    view.columnByName('thmAmt').visible = false;
  }
});

async function onClickIcon() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP',
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });

  if (result) {
    searchParams.value.prtnrKnm = payload.prtnrKnm;
    searchParams.value.prtnrNo = payload.prtnrNo;
  }
}

let cachedParams;

async function fetchData() {
  cachedParams = { ...frmMainData.value };
  return await dataService.get('/sms/wells/competence/business/activity/base', { params: cachedParams });
}

async function onClickUnitPrice() {
  const { result, payload } = await modal({
    component: 'WwpsfActivityGoodsUnitPriceMgtP',
    componentProps: {
      ogTpCd: frmMainData.value.ogTpCd,
    },
  });

  if (result) {
    console.log(payload);
  }
}

async function onClickSize() {
  const { result, payload } = await modal({
    component: 'WwpsfActivityGoodsSizeMgtP',
    componentProps: {
      ogTpCd: frmMainData.value.ogTpCd,
    },
  });

  if (result) {
    console.log(payload);
  }
}

async function fetchPages() {
  const res = await dataService.get('/sms/wells/competence/business/activity/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(products);
  view.resetCurrent();
}

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchPages();
};

async function init() {
  const res = await fetchData();
  Object.assign(frmMainData.value, res.data);
  await onClickSearch();
}

watch(() => frmMainData.value.ogTpCd, async () => {
  await init();
});

watch(() => searchParams.value.actiStatCd, async () => {
  await onClickSearch();
});

async function onClickSave() {
  await dataService.post('/sms/wells/competence/business/activity/base', frmMainData.value);
  notify(t('MSG_ALT_SAVE_DATA'));
  await init();
}

async function onClickCancel(type) {
  // 코드 : ACTI_GDS_APLC_STAT_CD->01:신청, 02:취소, 03:반품
  console.log(type);
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  if (type === '02') {
    const res = await modal({
      component: 'WwpsfCancelRegistrationRegP',
      componentProps: { ogTpCd: searchParams.value.ogTpCd, checkedRows },
    });

    if (res.result) {
      console.log(res.result);
      await onClickSearch();
    }
  } else {
    const res = await modal({
      component: 'WwpsfReturningRegistrationRegP',
      componentProps: { ogTpCd: searchParams.value.ogTpCd, checkedRows },
    });

    if (res.result) {
      console.log(res.result);
      await onClickSearch();
    }
  }
}

async function onClickPopup() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
    return;
  }
  const res = await modal({
    component: 'WwpsfActivityGoodsFeeDeductionRegP',
    componentProps: { checkedRows },
  });

  if (res.result) {
    console.log(res.result);
    await onClickSearch();
  }
}

function isExistData(rowData) {
  return rowData.some((v) => {
    const { countMcn } = v;
    if (Number(countMcn) === 0) {
      alert(t('MSG_ALT_DDTN_APLC'));
      return false;
    }

    return true;
  });
}

async function onClickDelete() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);
  if (checkedRows.length === 0) {
    notify(t('MSG_ALT_NOT_SEL_ITEM'));
  } else if (isExistData(checkedRows)) {
    checkedRows.map((row) => ({
      ogTpCd: row.ogTpCd,
      actiGdsDdtnId: row.actiGdsDdtnId,
      maxFeeDdtnOcDt: row.maxFeeDdtnOcDt,
    }));
    if (await confirm(t('MSG_ALT_DDTN_CAN'))) {
      await dataService.delete('/sms/wells/competence/business/activity/deduction-itemization', { data: checkedRows });
      await onClickSearch();
    }
  }
}

/**
 * 엑셀다운로드
 */
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();

  // 전체 조회 다운 (쿼리조회)
  cachedParams = cloneDeep(searchParams.value);
  const res = await dataService.get('/sms/wells/competence/business/activity/excel-download', { params: cachedParams });

  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName, // 메뉴명으로 다운로드 엑셀 파일명 세팅
    timePostfix: true,
    exportData: res.data,
  });
  // grdMainRef.value.getData().clearRows();
  // onClickSearch();
}

async function onClickExcelUpload() {
  const apiUrl = '/sms/wells/competence/business/activity/excel-upload';
  const templateId = 'FOM_ACTI_GDS_APLC'; // 양식다운로드
  const {
    payload,
  } = await modal({
    component: 'ZwcmzExcelUploadP',
    componentProps: { apiUrl, templateId },
  });
  if (payload.status === 'S') {
    notify(t('MSG_ALT_SAVE_DATA'));
    await onClickSearch();
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'ogTpCd' },
    { fieldName: 'actiGdsAplcId' },
    { fieldName: 'actiGdsAplcSn' },
    { fieldName: 'aplcRsonCn' },
    { fieldName: 'aplcDtS' },
    { fieldName: 'aplcDt' },
    { fieldName: 'cralLocaraTno' },
    { fieldName: 'mexnoEncr' },
    { fieldName: 'cralIdvTno' },
    { fieldName: 'actiGdsAplcStatCd' },
    { fieldName: 'actiGdsAplcStatNm' },
    { fieldName: 'bldNm' },
    { fieldName: 'prtnrNo' },
    { fieldName: 'prtnrKnm' },
    { fieldName: 'col5' },
    { fieldName: 'startYrmn' },
    { fieldName: 'baseDvNm' },
    { fieldName: 'col8' },
    { fieldName: 'actiGdsNm' },
    { fieldName: 'aplcQty' },
    { fieldName: 'col11' },
    { fieldName: 'maxFeeDdtnOcDt' },
    { fieldName: 'actiGdsAmt', dataType: 'number' },
    { fieldName: 'sumFeeDdtnDstAmt', dataType: 'number' },
    { fieldName: 'thmAmt', dataType: 'number' },
    { fieldName: 'patDdtnMcn' },
    { fieldName: 'countMcn', dataType: 'number' },
    { fieldName: 'col17' },
    { fieldName: 'col18' },
    { fieldName: 'sppDt' },
    { fieldName: 'sppBzsCd' },
    { fieldName: 'sppBzsNm' },
    { fieldName: 'col21' },
    { fieldName: 'sppIvcNo' },
    { fieldName: 'pnpyamOcAmt' },
    { fieldName: 'actiGdsDdtnId' },
    { fieldName: 'actiGdsStddNm' },
    { fieldName: 'cltnDt' },
    { fieldName: 'cntrDt' },

  ];

  const columns = [
    { fieldName: 'actiGdsAplcStatNm', header: t('MSG_TXT_STT'), width: '80', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_MSG_TXT_LOCARA_AND_BLD_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'prtnrNo', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '100', styleName: 'text-center' },
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_PIC_NM'), width: '100', styleName: 'text-left' },
    { fieldName: 'cntrDt', header: t('MSG_TXT_CNTR_DATE'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'cltnDt', header: t('MSG_TXT_CLTN_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'col5',
      header: t('MSG_TXT_MPNO'),
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno: no1, mexnoEncr: no2, cralIdvTno: no3 } = grid.getValues(index.itemIndex);
        let value = '';
        if (no1 !== undefined) {
          value += no1;
        }
        value += '-';
        if (no2 !== undefined) {
          value += no2;
        }
        value += '-';
        if (no3 !== undefined) {
          value += no3;
        }
        return value;
      },
    },
    { fieldName: 'startYrmn', header: t('MSG_TXT_OPNG_YM'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'baseDvNm', header: t('MSG_TXT_DIV'), width: '80', styleName: 'text-center' },
    { fieldName: 'aplcDtS', header: t('MSG_TXT_APPL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'actiGdsNm', header: t('MSG_TXT_CODE'), width: '150', styleName: 'text-center' },
    { fieldName: 'aplcQty', header: t('MSG_TXT_QTY'), width: '80', styleName: 'text-center' },
    { fieldName: 'actiGdsStddNm', header: t('MSG_TXT_SZ'), width: '80', styleName: 'text-center' },
    { fieldName: 'maxFeeDdtnOcDt', header: t('MSG_TXT_FNL_OC_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'actiGdsAmt', header: t('MSG_TXT_TOT_OJ_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'sumFeeDdtnDstAmt', header: t('MSG_TXT_ACU_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0' },
    { fieldName: 'thmAmt', header: t('MSG_TXT_THM_AMT'), width: '100', styleName: 'text-right', dataType: 'number', numberFormat: '#,##0', visible: false },
    { fieldName: 'patDdtnMcn', header: t('MSG_TXT_PAT_N'), width: '80', styleName: 'text-center' },
    { fieldName: 'countMcn', header: t('MSG_TXT_ORDR'), width: '50', styleName: 'text-center' },
    { fieldName: 'col17',
      header: t('MSG_TXT_CANC_DT'),
      width: '100',
      styleName: 'text-center',
      datetimeFormat: 'date',
      displayCallback(grid, index) {
        const { actiGdsAplcStatCd, aplcDt } = grid.getValues(index.itemIndex);
        let value = '';
        if (actiGdsAplcStatCd === '02') {
          value = stringUtil.getDateFormat(aplcDt);
        }
        return value;
      },
    },
    { fieldName: 'col18',
      header: t('MSG_TXT_CAN_RSON'),
      width: '100',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { actiGdsAplcStatCd, aplcRsonCn } = grid.getValues(index.itemIndex);
        let value = '';
        if (actiGdsAplcStatCd === '02') {
          value = aplcRsonCn;
        }
        return value;
      } },

    { fieldName: 'sppDt', header: t('MSG_TXT_RTNGD_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'sppBzsNm', header: t('MSG_TXT_PCSV_CO'), width: '100', styleName: 'text-left' },
    { fieldName: 'col21',
      header: t('MSG_TXT_RTRN_RSN'),
      width: '150',
      styleName: 'text-left',
      displayCallback(grid, index) {
        const { actiGdsAplcStatCd, aplcRsonCn } = grid.getValues(index.itemIndex);
        let value = '';
        if (actiGdsAplcStatCd === '03') {
          value = aplcRsonCn;
        }
        return value;
      } },
    { fieldName: 'sppIvcNo', header: t('MSG_TXT_IVC_NO'), width: '100', styleName: 'text-center' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.setCheckBar({
    showAll: false,
  });
  view.onItemChecked = (g, itemIndex) => {
    if (g.isCheckedItem(itemIndex)) {
      if (g.getValue(itemIndex, 'actiGdsAplcStatCd') === '02' || g.getValue(itemIndex, 'actiGdsAplcStatCd') === '03') {
        g.checkItem(itemIndex, false);
      }
    }
  };

  // multi row header setting
  view.setColumnLayout([
    'actiGdsAplcStatNm',
    {
      header: t('MSG_TXT_APPL_USER'),
      direction: 'horizontal',
      items: ['bldNm', 'prtnrNo', 'prtnrKnm', 'cntrDt', 'cltnDt'],

    },

    'col5', 'startYrmn', 'baseDvNm',
    {
      header: t('MSG_TXT_APLC_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['aplcDtS', 'actiGdsNm', 'aplcQty', 'actiGdsStddNm'],
    },
    {
      header: t('MSG_TXT_DDTN_INF'), // colspan title
      direction: 'horizontal', // merge type
      items: ['maxFeeDdtnOcDt', 'actiGdsAmt', 'sumFeeDdtnDstAmt', 'thmAmt', 'patDdtnMcn', 'countMcn'],
    },
    'col17', 'col18', 'sppDt', 'sppBzsNm', 'col21', 'sppIvcNo',
  ]);
});
onMounted(async () => {
  await init();
  await onClickSearch();
});
</script>
