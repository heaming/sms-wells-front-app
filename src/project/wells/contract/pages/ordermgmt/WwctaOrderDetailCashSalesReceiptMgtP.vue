<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaOrderDetailCashSalesReceiptMgtP - 주문상세페이지 내부 팝업_현금영수증
3. 작성자 : Myoungbin Joo
4. 작성일 : 2023.04.07
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************np
- 주문상세페이지 내부 팝업_현금영수증 화면
****************************************************************************************************
--->

<template>
  <kw-form
    ref="frmBaseRef"
    :cols="2"
    class="mt20"
  >
    <!-- 현금영수증 기본정보 변경 -->
    <h3>{{ `${$t('MSG_TXT_CASH_RCP')} ${$t('MSG_TXT_BASIC_INFO')} ${$t('MSG_TXT_CH')}` }}</h3>

    <div class="border-box mt10">
      <kw-form-row>
        <!-- 발행구분 -->
        <kw-form-item
          :label="t('MSG_TXT_ISSUANCE_CLAR')"
          required
        >
          <kw-field-wrap>
            <kw-select
              v-model="fieldBaseParams.afchCssrIsDvCd"
              :options="codes.CSSR_IS_DV_CD"
              :readonly="isDefault"
              :label="t('MSG_TXT_ISSUANCE_CLAR')"
              rules="required"
              @change="onChangedCssrIsDvCd()"
            />
            <kw-input
              v-model="fieldBaseParams.afchCssrIsNo"
              v-model:tel-no0="fieldBaseParams.cralLocaraTno"
              v-model:tel-no1="fieldBaseParams.mexnoEncr"
              v-model:tel-no2="fieldBaseParams.cralIdvTno"
              class="px5"
              :mask="fieldBaseParams.mask"
              :rules="cssrIsDvCdRules(fieldBaseParams.afchCssrIsDvCd, isCssrEmpty)"
              :label="t('MSG_TXT_ISSUANCE_CLAR')"
              :readonly="isCssrEmpty"
            />
          </kw-field-wrap>
        </kw-form-item>
        <!-- 변경사유 -->
        <kw-form-item
          :label="t('MSG_TXT_CH_RSON')"
          required
        >
          <kw-input
            v-model="fieldBaseParams.chRsonCn"
            type="text"
            class="px5"
            :label="t('MSG_TXT_CH_RSON')"
            :placeholder="t('MSG_TXT_MORE_INP_CHARS', [10])"
            rules="required|min:10"
            maxlength="2000"
            :readonly="isDefault"
          />
        </kw-form-item>
      </kw-form-row>
    </div>
    <kw-action-bottom>
      <div v-show="!isDefault">
        <!-- 초기화 -->
        <!-- <kw-btn
          :label="$t('MSG_BTN_INTL')"
          class="mx7"
          @click="onClickBaseReset"
        /> -->
        <!-- 저장 -->
        <kw-btn
          v-permission:create
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickSave"
        />
      </div>
      <!-- 기본정보 변경 -->
      <kw-btn
        v-show="isDefault"
        v-model="defaultCheck"
        v-permission:create
        :label="`${$t('MSG_TXT_BASIC_INFO')} ${$t('MSG_TXT_CH')}`"
        @click="onclickDefault"
      />
    </kw-action-bottom>
  </kw-form>

  <h3>{{ `${$t('MSG_TXT_CASH_RCP')} ${$t('MSG_TXT_ISSUANCE_IZ')}` }}</h3> <!-- 현금영수증 발행내역 -->
  <kw-action-top>
    <template #left>
      <kw-paging-info
        :total-count="totalCount"
      />
    </template>
    <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
  </kw-action-top>

  <kw-grid
    ref="grdMainRef"
    :visible-rows="10"
    @init="initGrid"
  />
  <kw-form
    ref="frmRpblRef"
    :cols="2"
    class="mt20"
  >
    <h3>{{ `${$t('MSG_TXT_CASH_RCP')} ${$t('MSG_TXT_RPBL')}` }}</h3> <!-- 현금영수증 재발행 -->

    <div class="border-box mt10">
      <kw-form-row>
        <!-- 발행구분 -->
        <kw-form-item
          :label="t('MSG_TXT_ISSUANCE_CLAR')"
          required
        >
          <kw-field-wrap>
            <kw-select
              v-model="fieldRpblParams.cssrIsDvCd"
              :options="codes.CSSR_IS_DV_CD"
              rules="required"
              @change="onChangedCssrIsDvCdRpbl"
            />
            <kw-input
              v-model="fieldRpblParams.cssrIsNo"
              v-model:tel-no0="fieldRpblParams.cralLocaraTno"
              v-model:tel-no1="fieldRpblParams.mexnoEncr"
              v-model:tel-no2="fieldRpblParams.cralIdvTno"
              class="px5"
              :mask="fieldRpblParams.mask"
              :rules="cssrIsDvCdRules(fieldRpblParams.cssrIsDvCd, isCssrRpblEmpty)"
              :label="t('MSG_TXT_ISSUANCE_CLAR')"
              :readonly="isCssrRpblEmpty"
            />
          </kw-field-wrap>
        </kw-form-item>
        <!-- 변경사유 -->
        <kw-form-item
          :label="t('MSG_TXT_CH_RSON')"
          required
        >
          <kw-input
            v-model="fieldRpblParams.chRsonCn"
            type="text"
            class="px5"
            :label="t('MSG_TXT_CH_RSON')"
            :placeholder="t('MSG_TXT_MORE_INP_CHARS', [10])"
            :readonly="isCssrRpblEmpty"
            rules="required|min:10"
            maxlength="2000"
          />
        </kw-form-item>
      </kw-form-row>
    </div>
  </kw-form>
  <kw-action-bottom>
    <!-- 초기화 -->
    <!-- <kw-btn
      :label="$t('MSG_BTN_INTL')"
      @click="onClickRpblReset"
    /> -->
    <!-- 재발행 -->
    <kw-btn
      v-permission:create
      :label="t('MSG_BTN_RPBL')"
      :disable="checkedTxinvList <= 0"
      @click="onClickRpbl"
    />
  </kw-action-bottom>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useDataService, alert, notify, defineGrid, gridUtil } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const dataService = useDataService();

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' }, // 계약번호
  cntrSn: { type: String, required: false, default: '' }, // 계약일련번호
  cstNo: { type: String, required: false, default: '' }, // 고객번호
});

const frmBaseRef = ref(getComponentType('KwForm'));
const frmRpblRef = ref(getComponentType('KwForm'));

const defaultCheck = ref(true); // 기본정보 변경 버튼 초기값
const grdMainRef = ref();
const totalCount = ref(0);

const searchParams = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  cstNo: props.cstNo,
});

const checkedTxinvList = ref(0);

const cachedParams = ref({
  chRsonCn: '', // 변경사유
  cssrIsDvCd: '', // 발행구분
  cralLocaraTno: '', // 휴대전화 통신사 식별번호
  cssrIsNo: '', // 발행구분 값
  mexnoEncr: '', // 휴대전화 중간자리
  cralIdvTno: '', // 휴대전화 끝자리
  phoneNo: '', // 휴대전화 전체번호
  mask: '', // 마스크
  cssrTrdDvCd: '', // 공제구분
  afchCssrIsDvCd: '', // 변경 후 발행구분
  afchCssrIsNo: '', // 변경 후 발행번호
  afchCssrTrdDvCd: '', // 변경 후 공제구분
});

const fieldBaseParams = ref({
  // 기본정보 변경
  chRsonCn: '', // 변경사유
  cssrIsDvCd: '', // 발행구분
  cralLocaraTno: '', // 휴대전화 통신사 식별번호
  cssrIsNo: '', // 발행구분 값
  mexnoEncr: '', // 휴대전화 중간자리
  cralIdvTno: '', // 휴대전화 끝자리
  phoneNo: '', // 휴대전화 전체번호
  mask: '', // 마스크
  cssrTrdDvCd: '', // 공제구분
  afchCssrIsDvCd: '', // 변경 후 발행구분
  afchCssrIsNo: '', // 변경 후 발행번호
  afchCssrTrdDvCd: '', // 변경 후 공제구분
});

const fieldRpblParams = ref({
  // 재발행
  chRsonCn: '', // 변경사유
  cssrIsDvCd: '', // 발행구분
  cralLocaraTno: '', // 휴대전화 통신사 식별번호
  cssrIsNo: '', // 발행구분 값
  mexnoEncr: '', // 휴대전화 중간자리
  cralIdvTno: '', // 휴대전화 끝자리
  phoneNo: '', // 휴대전화 전체번호
  mask: '', // 마스크
  afchCssrTrdDvCd: '', // 공제구분
});

const isDefault = computed(() => defaultCheck.value); // 기본정보 변경 버튼클릭 여부
const isCssrEmpty = computed(() => isEmpty(fieldBaseParams.value.afchCssrIsDvCd) || isDefault.value); // 발행구분 선택 여부
const isCssrRpblEmpty = computed(() => isEmpty(fieldRpblParams.value.cssrIsDvCd)); // 재발행구분 선택 여부
const isInitOpen = ref(false);

const codes = await codeUtil.getMultiCodes(
  'CSSR_IS_DV_CD', // 발행구분코드
  'CSSR_APR_RS_CD', // 승인결과
);

codes.CSSR_IS_DV_CD = codes.CSSR_IS_DV_CD.filter((v) => v.codeId !== '2');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

/* TODO: 현금영수증 테이블 모델링 완료 후 저징 맟 재발행 추가 예정 */

// changeMask: Mask 포맷 설정
function changeMask(cssrIsDvCd) {
  let mask;
  console.log('cssrIsDvCd:', cssrIsDvCd);
  switch (cssrIsDvCd) {
    case '1':
      mask = '####-####-####-####';
      break;
    case '3':
      mask = '###-##-#####';
      break;
    default:
      mask = 'telephone';
      break;
  }
  return mask;
}

// fetchData: 기본정보 조회 및 현금영수증 발행내역 조회
async function fetchData() {
  grdMainRef.value.getData().clearRows();
  cachedParams.value = cloneDeep(searchParams.value);

  const resBaseInfo = await dataService.get('/sms/wells/contract/contracts/order-details/cash-sales-receipts', { params: cachedParams.value });
  if (!isEmpty(resBaseInfo.data)) {
    Object.assign(fieldBaseParams.value, resBaseInfo.data);

    fieldBaseParams.value.afchCssrIsNo = fieldBaseParams.value.cssrIsNo;
    fieldBaseParams.value.afchCssrIsDvCd = fieldBaseParams.value.cssrIsDvCd;
    fieldBaseParams.value.chRsonCn = isEmpty(resBaseInfo.data.chRsonCn) ? '' : resBaseInfo.data.chRsonCn;

    isInitOpen.value = true;
  } else {
    fieldBaseParams.value.cntrNo = searchParams.value.cntrNo;
    fieldBaseParams.value.cntrSn = searchParams.value.cntrSn;
    fieldBaseParams.value.cstNo = searchParams.value.cstNo;
  }

  const resList = await dataService.get('/sms/wells/contract/contracts/order-details/cash-sales-receipt-pbls', { params: { cntrNo: searchParams.value.cntrNo, cntrSn: searchParams.value.cntrSn } });
  const view = grdMainRef.value.getView();
  const data = view.getDataSource();

  totalCount.value = resList.data.length;

  data.checkRowStates(false);
  data.addRows(resList.data);
  data.checkRowStates(true);

  isInitOpen.value = false;
}

// onclickDefault: 기본정보 변경 버튼 클릭
function onclickDefault() {
  defaultCheck.value = !defaultCheck.value;
}

// onClickSave 기본정보 변경 저장 버튼 클릭
async function onClickSave() {
  if (!await frmBaseRef.value.validate()) { return; }
  if (await frmBaseRef.value.alertIfIsNotModified()) { return; }

  switch (fieldBaseParams.value.afchCssrTrdDvCd) {
    case '3': // 사업자등록번호
      fieldBaseParams.value.afchCssrTrdDvCd = '01';
      break;

    default: // 휴대전화, 카드번호
      fieldBaseParams.value.afchCssrTrdDvCd = '00';
      break;
  }

  if (fieldRpblParams.value.cssrIsDvCd === '4') {
    fieldBaseParams.value.afchCssrIsNo = `${fieldBaseParams.value.cralLocaraTno}${fieldBaseParams.value.mexnoEncr}${fieldBaseParams.value.cralIdvTno}`;
  }

  await dataService.post('/sms/wells/contract/contracts/order-details/cash-sales-receipts', fieldBaseParams.value);
  notify(t('MSG_ALT_SAVE_DATA'));
}

// onClickRpbl: 재발행 버튼 클릭
async function onClickRpbl() {
  let view = '';
  let checkItem = '';
  let cssrIsNo = '';

  view = grdMainRef.value.getView();
  checkItem = gridUtil.getCheckedRowValues(view);

  if (checkItem.length === 0) {
    alert('수정할 항목 선택 후 클릭 해 주세요');
    return;
  }

  if (!await frmRpblRef.value.validate()) { return; }
  if (await frmRpblRef.value.alertIfIsNotModified()) { return; }

  switch (fieldRpblParams.value.cssrIsDvCd) {
    case '3': // 사업자등록번호
      fieldRpblParams.value.afchCssrTrdDvCd = '01';
      break;

    default: // 휴대전화, 카드번호
      fieldRpblParams.value.afchCssrTrdDvCd = '00';
      break;
  }

  if (fieldRpblParams.value.cssrIsDvCd === '4') {
    cssrIsNo = `${fieldRpblParams.value.cralLocaraTno}${fieldRpblParams.value.mexnoEncr}${fieldRpblParams.value.cralIdvTno}`;
  } else {
    cssrIsNo = fieldRpblParams.value.cssrIsNo;
  }

  checkItem.forEach((p1) => {
    p1.afchCssrIsDvCd = fieldRpblParams.value.cssrIsDvCd; // 발행구분
    p1.afchCssrIsNo = cssrIsNo; // 발행번호 (입력한 사업자등록번호, 휴대전화...)
    p1.afchCssrTrdDvCd = fieldRpblParams.value.afchCssrTrdDvCd; // 공제구분
    p1.chRsonCn = fieldRpblParams.value.chRsonCn; // 변경사유
    p1.cntrNo = searchParams.value.cntrNo; // 계약번호
    p1.cntrSn = searchParams.value.cntrSn; // 계약일련번호
    p1.cstNo = searchParams.value.cstNo;
  });

  // await dataService.post('/sms/common/withdrawal/pchssl/cash-sales-receipt-approval-state/history', checkItem);
  await dataService.post('/sms/wells/contract/contracts/order-details/cash-sales-receipt-rpbls', checkItem);
  notify(t('MSG_ALT_SAVE_DATA'));
  fetchData();
}

// onClickRpblReset: 재발행 초기화 버튼 블릭
// function onClickRpblReset() {
//   frmRpblRef.value.reset();
//   frmRpblRef.value.init();
// }

function changeBaseValues() {
  if (!isInitOpen.value) {
    console.log('asdasd');
    fieldBaseParams.value.afchCssrIsNo = null; // 발행구분 값
    fieldBaseParams.value.cralLocaraTno = null; // 휴대전화 통신사 식별번호
    fieldBaseParams.value.mexnoEncr = null; // 휴대전화 중간자리
    fieldBaseParams.value.cralIdvTno = null; // 휴대전화 끝자리
    fieldBaseParams.value.mask = changeMask(fieldBaseParams.value.afchCssrIsDvCd);
  } else {
    fieldBaseParams.value.mask = changeMask(fieldBaseParams.value.cssrIsDvCd);
  }
  return fieldBaseParams.value.mask;
}

// onChangedCssrIsDvCd: 기본정보 발행구분 변경 시 발생하는 이벤트
async function onChangedCssrIsDvCd() {
  return changeBaseValues();
}

// onClickBaseReset: 기본정보 변경 초기화 버튼 블릭
// function onClickBaseReset() {
//   frmBaseRef.value.reset();
//   frmBaseRef.value.init();
// }

// 발행구분 규칙함수
function cssrIsDvCdRules(cssrIsDvCd, readOnly) {
  let rule = '';

  if (!readOnly) {
    switch (cssrIsDvCd) {
      case '4': // 휴대전화
        rule = 'required|telephone';
        break;

      case '3': // 사업자등록번호
        rule = 'required|min:10';
        break;

      case '1': // 카드번호
        rule = 'required|min:16';
        break;

      default:
        rule = 'required';
        break;
    }
  }
  return rule;
}

// onChangedCssrIsDvCdRpbl: 재발행 초기화 버튼 블릭
async function onChangedCssrIsDvCdRpbl() {
  fieldRpblParams.value.cssrIsNo = null; // 발행구분 값
  fieldRpblParams.value.cralLocaraTno = null; // 휴대전화 통신사 식별번호
  fieldRpblParams.value.mexnoEncr = null; // 휴대전화 중간자리
  fieldRpblParams.value.cralIdvTno = null; // 휴대전화 끝자리

  fieldRpblParams.value.mask = changeMask(fieldRpblParams.value.cssrIsDvCd); // 마스크
}

// 계약번호, 계약일련번호 세팅 (부모창에서 호출)
async function setDatas(cntrNo, cntrSn, cstNo) {
  searchParams.value.cntrNo = cntrNo;
  searchParams.value.cntrSn = cntrSn;
  searchParams.value.cstNo = cstNo;

  fetchData();
}

// 외부에서 사용할 수 있도록 노출 선언
defineExpose({
  setDatas,
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'kwGrpCoCd' },
    { fieldName: 'cssrAgrgSn' },
    { fieldName: 'cssrRveDvCd' },
    { fieldName: 'rveDt' },
    { fieldName: 'dpDvCd' },
    { fieldName: 'cssrDtlSn' },
    { fieldName: 'cssrIsDvCd' },
    { fieldName: 'bfchCssrIsNo' },
    { fieldName: 'bfchCssrIsNoEncr' },
    { fieldName: 'bfchCssrMexnoEncr' },
    { fieldName: 'bfchCssrCrcdNoEncr' },
    { fieldName: 'bfchCssrTrdAmt', dataType: 'number' },
    { fieldName: 'bfchCssrAprRsCd' },
    { fieldName: 'afchCssrIsNo' },
    { fieldName: 'afchCssrIsNoEncr' },
    { fieldName: 'afchCssrMexnoEncr' },
    { fieldName: 'afchCssrCrcdNoEncr' },
    { fieldName: 'afchCssrIsDvCd' },
    { fieldName: 'chRsonCn' },
    { fieldName: 'fnlMdfcDtm' },
    { fieldName: 'fnlMdfcUsrNm' },
    { fieldName: 'fnlMdfcUsrId' },
  ];

  const columns = [
    { fieldName: 'rveDt', header: t('MSG_TXT_RVE_DT'), width: '131', styleName: 'text-center', datetimeFormat: 'date' }, // 수납일자
    { fieldName: 'cssrIsDvCd', header: t('MSG_TXT_ISSUANCE_CLAR'), width: '131', styleName: 'text-center', options: codes.CSSR_IS_DV_CD }, // 발행구분
    { fieldName: 'bfchCssrIsNo',
      header: `${t('MSG_TXT_BFCH')} ${t('MSG_TXT_PBL_NO')}`,
      width: '131',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { bfchCssrIsNoEncr, bfchCssrMexnoEncr, bfchCssrCrcdNoEncr } = grid.getValues(index.itemIndex);
        if (!isEmpty(bfchCssrIsNoEncr)) {
          return bfchCssrIsNoEncr;
        }
        if (!isEmpty(bfchCssrMexnoEncr)) {
          return bfchCssrMexnoEncr;
        }
        if (!isEmpty(bfchCssrCrcdNoEncr)) {
          return bfchCssrCrcdNoEncr;
        }
      },
    }, // 변경 전 발핸번호
    { fieldName: 'bfchCssrTrdAmt', header: t('MSG_TXT_AMT'), width: '131', styleName: 'text-right' }, // 금액
    { fieldName: 'bfchCssrAprRsCd', header: t('MSG_TXT_APR_RS'), width: '131', styleName: 'text-center', options: codes.CSSR_APR_RS_CD }, // 승인결과
    { fieldName: 'afchCssrIsNo',
      header: `${t('MSG_TXT_AFCH')} ${t('MSG_TXT_PBL_NO')}`,
      width: '131',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { afchCssrIsNoEncr, afchCssrMexnoEncr, afchCssrCrcdNoEncr } = grid.getValues(index.itemIndex);
        if (!isEmpty(afchCssrIsNoEncr)) {
          return afchCssrIsNoEncr;
        }
        if (!isEmpty(afchCssrMexnoEncr)) {
          return afchCssrMexnoEncr;
        }
        if (!isEmpty(afchCssrCrcdNoEncr)) {
          return afchCssrCrcdNoEncr;
        }
      },
    }, // 변경 후 발행번호
    { fieldName: 'chRsonCn', header: t('MSG_TXT_CH_RSON'), width: '99', styleName: 'text-center' }, // 변경사유
    { fieldName: 'fnlMdfcDtm', header: t('MSG_TXT_RGST_DT'), width: '99', styleName: 'text-center', datetimeFormat: 'datetime' }, // 등록일
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_FST_RGST_USR'), width: '99', styleName: 'text-center' }, // 등록자
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: '99', styleName: 'text-center' }, // 번호

  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  /*
  view.setCheckableCallback((dataSource, item) => {
    const index = item.dataRow;
    const afchCssrIsNo = gridUtil.getCellValue(view, index, 'afchCssrIsNo');

    if (isEmpty(afchCssrIsNo)) {
      return true;
    }
    return false;
  }, true);
  */

  view.onItemChecked = () => {
    const checkCount = view.getCheckedRows().length;
    checkedTxinvList.value = checkCount;
  };

  view.onItemAllChecked = () => {
    const checkCount = view.getCheckedRows().length;
    checkedTxinvList.value = checkCount;
  };
});
</script>
