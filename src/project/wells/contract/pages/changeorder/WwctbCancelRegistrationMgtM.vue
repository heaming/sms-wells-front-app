<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbCancelRegistrationMgtM - 취소등록
3. 작성자 : younuk.choi
4. 작성일 : 2023.07.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 취소등록
- TODO : OZ 레포트 (거래명세서 보기)
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="normal-area normal-area--button-set-bottom px0">
      <kw-search
        cols="3"
        one-row
        @search="onClickSearch"
      >
        <kw-search-row>
          <!-- 계약상세번호 -->
          <kw-search-item
            :label="$t('MSG_TXT_CNTR_DTL_NO')"
          >
            <zctz-contract-detail-number
              v-model:cntr-no="searchParams.cntrNo"
              v-model:cntr-sn="searchParams.cntrSn"
              :select-only-validation="false"
            />
          </kw-search-item>
          <!-- 고객번호 -->
          <kw-search-item
            :label="$t('MSG_TXT_CST_NO')"
          >
            <kw-input
              v-model="searchParams.cstNo"
              icon="search"
              regex="num"
              @click-icon="onClickSearchCst"
            />
          </kw-search-item>
          <!-- 조회년월 -->
          <kw-search-item
            :label="$t('MSG_TXT_INQR_YM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.dm"
              :label="$t('MSG_TXT_INQR_YM')"
              type="month"
              rules="required"
            />
          </kw-search-item>
        </kw-search-row>
      </kw-search>

      <div
        v-show="!isEmpty(cachedParams)"
        class="result-area pb10"
      >
        <kw-list
          item-padding="20px 0"
        >
          <!-- 1. 계약리스트 --------------------------------------------------------------------------->
          <kw-expansion-item
            padding-target="header"
            expansion-icon-align="center"
            expand-icon-class="kw-font-pt24"
            default-opened
          >
            <template #header>
              <kw-item-section>
                <kw-item-label>
                  <span class="text-weight-medium kw-font-pt18">1. {{ t('MSG_TXT_CNTR_LIST') }}</span>
                </kw-item-label>
              </kw-item-section>
            </template>
            <div class="pb20">
              <kw-action-top>
                <template #left>
                  <kw-paging-info :total-count="totalCount" />
                </template>
                <kw-btn
                  dense
                  secondary
                  :label="$t('MSG_TXT_TRD_SPCSH')+' '+$t('MSG_BTN_VIEW')"
                  :disable="!totalCount"
                  @click="onClickSpcshView"
                />

                <kw-separator
                  spaced
                  vertical
                  inset
                />
                <kw-btn
                  dense
                  negative
                  :label="$t('MSG_TXT_SELT')+$t('MSG_TXT_CNT')+' '+$t('MSG_TXT_CANCEL')+$t('MSG_TXT_RGS')"
                  :disable="!totalCount"
                  @click="onClickRegistCancel"
                />
              </kw-action-top>
              <kw-grid
                ref="grdMain"
                :visible-rows="5"
                @init="initGrid"
              />
            </div>
          </kw-expansion-item>
        </kw-list>

        <slot v-if="cancelDetailList.length > 0">
          <kw-separator class="mt20 mb0" />
          <!-- SUMMARY --------------------------------------------------------------------------->
          <div class="row justify-between my20">
            <div class="row items-center">
              <span class="kw-font-pt18 text-weight-medium pr30">{{ cancelDetailList[idx].sellTpNm }}</span>
              <kw-separator
                spaced
                vertical
                class="mx12 my8"
              />
              <span class="kw-font-pt18 text-weight-medium pr30">
                {{ cancelDetailList[idx].cntrNo }}-{{ cancelDetailList[idx].cntrSn }}</span>

              <kw-separator
                spaced
                vertical
                class="mx12 my8"
              />
              <p class="kw-font-pt14 w80 ">
                {{ t('MSG_TXT_CNTRCT_DT') }}
              </p>
              <span class="kw-font-pt18 text-weight-medium pr30">
                {{ stringUtil.getDateFormat(cancelDetailList[idx].cntrCnfmDt) }}</span>
              <kw-separator
                spaced
                vertical
                class="mx12 my8"
              />
              <p class="kw-font-pt14 w80 ">
                {{ t('MSG_TXT_CST_NM') }}
              </p>
              <span class="kw-font-pt18 text-weight-medium pr30">{{ cancelDetailList[idx].cntrCstKnm }}</span>
              <kw-separator
                spaced
                vertical
                class="mx12 my8"
              />
              <span class="kw-font-pt18 text-weight-medium">{{ cancelDetailList[idx].pdNm }}</span>
            </div>
            <div class="row items-center">
              <kw-btn
                :label="$t('MSG_BTN_VT_AC_CFDC')+' '+$t('MSG_BTN_VIEW')"
                secondary
                dense
                @click="onClickVirtualAccountView"
              />
              <div class="row items-center ml20">
                <kw-btn
                  icon="arrow_left_24"
                  borderless
                  class="kw-font-pt24"
                  :disable="idx<=0"
                  @click="onClickMove('L')"
                />
                <p class="kw-font-pt18 kw-fc--black1 mx4">
                  <span>{{ (idx+1) }}</span>
                  <span class="kw-fc--placeholder">/{{ cancelDetailList.length }}</span>
                </p>
                <kw-btn
                  icon="arrow_right_24"
                  borderless
                  class="kw-font-pt24"
                  :disable="idx+1>=cancelDetailList.length"
                  @click="onClickMove('R')"
                />
              </div>
            </div>
          </div>
          <kw-separator class="mt20 mb0" />

          <component
            :is="detailPanels[panelIdx].panel"
            :key="compKey"
            :sametype="sameType"
            :child-detail="cancelDetailList[idx]"
            @searchdetail="onSearchDetail"
            @savedetail="onSave"
            @removedetail="onDelete"
            @update:model-value="onUpdateValue"
          />
        </slot>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { getComponentType, gridUtil, stringUtil, useDataService, useGlobal, useMeta } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

import WwctbRentalCancelRegistrationMgtM from './WwctbRentalCancelRegistrationMgtM.vue';
import WwctbRegularShippingCancelRegistrationMgtM from './WwctbRegularShippingCancelRegistrationMgtM.vue';
import WwctbSinglePaymentCancelRegistrationMgtM from './WwctbSinglePaymentCancelRegistrationMgtM.vue';
import WwctbMembershipCancelRegistrationMgtM from './WwctbMembershipCancelRegistrationMgtM.vue';
import WwctbCancelRegistrationEmptyMgtM from './WwctbCancelRegistrationEmptyMgtM.vue';

const { t } = useI18n();
const { alert, confirm, modal, notify } = useGlobal();
const dataService = useDataService();
const { getUserInfo } = useMeta();
const sessionUserInfo = getUserInfo();
const grdMain = ref(getComponentType('KwGrid'));
const grdMainView = computed(() => grdMain.value?.getView());

const searchParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cstNo: '', // 고객번호
  dm: '', // 조회년월
});
const totalCount = ref(0);
const cachedParams = ref({});
const compKey = ref(0);
const sameType = ref('N');
const idx = ref(-1);
const cancelDetailList = ref([]);

const detailPanels = [
  {
    name: 'rental',
    panel: WwctbRentalCancelRegistrationMgtM,
  },
  {
    name: 'regularShipping',
    panel: WwctbRegularShippingCancelRegistrationMgtM,
  },
  {
    name: 'singlePayment',
    panel: WwctbSinglePaymentCancelRegistrationMgtM,
  },
  {
    name: 'membership',
    panel: WwctbMembershipCancelRegistrationMgtM,
  },
  {
    name: 'empty',
    panel: WwctbCancelRegistrationEmptyMgtM,
  },
];

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
function getPanelIdx(val) {
  switch (val) {
    case '1': return 2;
    case '3': return 3;
    case '6': return 1;
    default: return 0;
  }
}
// const panelIdx = ref(0);
const panelIdx = computed(() => getPanelIdx(cancelDetailList.value[idx.value].sellTpCd));

// 하위 component 강제 rendering
function forceRender() {
  const { sellTpCd } = cancelDetailList.value[idx.value];
  sameType.value = cancelDetailList.value.every((v) => v.sellTpCd === sellTpCd) ? 'Y' : 'N';
  panelIdx.value = getPanelIdx(sellTpCd);
  compKey.value += 1;
}

// 하위 아코디언 초기화
function initComponent() {
  idx.value = -1;
  cancelDetailList.value.splice(0, cancelDetailList.value.length);
}

async function fetchData() {
  if (isEmpty(cachedParams.value)) return;

  const res = await dataService.get('/sms/wells/contract/changeorder/cancel-base-infos', { params: { ...cachedParams.value } });

  totalCount.value = res.data.length;
  grdMainView.value.getDataSource().setRows(res.data.map((obj) => ({ ...obj, bulkApplyYN: 'N' })));
  grdMainView.value.getDataSource().checkRowStates(false);
}

async function onClickSearchCst() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo;
  }
}

// summary > 좌/우 이동 클릭
async function onClickMove(pDiv) {
  if (pDiv === 'L') {
    idx.value = (idx.value > 0) ? (idx.value - 1) : idx.value;
  } else {
    idx.value = (idx.value < cancelDetailList.value.length) ? (idx.value + 1) : idx.value;
  }

  forceRender();
}

// cancelDetailList 변경
async function setGridCheckandSelect(row, isCheck) {
  grdMainView.value.setValue(row, 'disableChk', isCheck ? 'Y' : 'N');
  grdMainView.value.setCheckable(row, !isCheck);

  // 추가
  if (isCheck) {
    if (cancelDetailList.value.findIndex((v) => v.cntrNo === grdMainView.value.getValue(row, 'cntrNo') && v.cntrSn === grdMainView.value.getValue(row, 'cntrSn')) >= 0) {
      await notify(`${grdMainView.value.getValue(row, 'cntrNo')}-${grdMainView.value.getValue(row, 'cntrSn')}은 이미 등록되었습니다.`);
      return;
    }

    cancelDetailList.value.push(grdMainView.value.getValues(row));
    if (idx.value < 0) { idx.value = 0; }

  // 삭제
  } else {
    const targetIdx = cloneDeep(idx.value);
    if ((targetIdx + 1) === cancelDetailList.value.length) {
      await onClickMove('L');
    }
    cancelDetailList.value.splice(targetIdx, 1);
  }
}

// 1. 계약리스트 > 선택건 취소등록 클릭
function onClickRegistCancel() {
  if (isEmpty(grdMainView.value.getCheckedRows())) {
    notify(t('MSG_ALT_LIST_CHO'));
    return;
  }

  if (cancelDetailList.value.length === 1 && cancelDetailList.value[0].cancelStatNm === '취소등록') {
    initComponent();
  }

  grdMainView.value.getCheckedRows().forEach((i) => {
    if (grdMainView.value.getValue(i, 'disableChk') === 'Y') {
      return true;
    }

    setGridCheckandSelect(i, true);
    grdMainView.value.checkItem(i, false);
  });

  grdMainView.value.setAllCheck(false);

  forceRender();
}

// 1. 계약리스트 > 거래명세서 보기 클릭
function onClickSpcshView() {
  /*
  - 해당 버튼은 해당 계약상세번호가 가상계좌를 발급한 경우에만 노출이 됩니다.
  가상계좌 발급 이력이 없으 면 버튼이 노출이 되지 않습니다.
  */
  notify('TODO : 가장계좌확인서 OZ뷰 호출 ');
}

// summary > 가상계좌확인서 클릭
function onClickVirtualAccountView() {
  /*
  거래명세서 보기 : 취소로 선택한 계약건에 대해서 거래명세서 OZ뷰를 호출 합니다
  - 조회된 계약건중에서 렌탈, 정기배송의 계약유형에만 보여지면 됩니다.
    (멤버십, 일시불은 거래명세서가 생성이 되지 않습니다.)
  */
  notify('TODO : 거래명세서 OZ뷰 호출 ');
}

// 5. 취소사항 > 취소사항 조회 클릭
async function onSearchDetail(subParam) {
  const { cntrNo, cntrSn, sellTpCd } = cancelDetailList.value[idx.value];
  const res = await dataService.get('/sms/wells/contract/changeorder/breach-promises', { params: {
    cntrNo, cntrSn, sellTpCd, ...subParam },
  });

  if (isEmpty(res.data)) {
    alert(t('MSG_TXT_NO_DATA_FOUND'));
    return;
  }

  res.data.isSearch = 'Y';
  res.data.slCtrRqrId = sessionUserInfo.employeeIDNumber; // 조정자 사번 셋팅
  res.data.rsgAplcDt = subParam.reqDt;
  res.data.lsnt = cancelDetailList.value[idx.value].lsnt;
  Object.assign(cancelDetailList.value[idx.value], res.data);
}

// 취소 클릭
async function onDelete() {
  const { cntrNo, cntrSn } = cancelDetailList.value[idx.value];
  const row = gridUtil.findDataRow(grdMainView.value, (e) => ((e.cntrNo === cntrNo) && (e.cntrSn === cntrSn)));

  await setGridCheckandSelect(row, false);

  forceRender();
}

// 저장 클릭
async function onSave() {
  let saveList = [];
  const param = cancelDetailList.value[idx.value];

  // 취소등록 정보 일괄적용 : 같은 판매유형의 취소등록건의 정보를 일괄적용
  if (param.bulkApplyYN === 'Y') {
    if (cancelDetailList.value.findIndex((v) => v.sellTpCd !== param.sellTpCd) >= 0) {
      await notify('판매유형이 모두 같은 경우만 일괄 적용이 가능합니다.');
      return;
    }

    const inValidIdx = cancelDetailList.value.findIndex((v) => v.sellTpCd !== '1' && v.isSearch !== 'Y');
    if (inValidIdx >= 0) {
      await notify(`[${inValidIdx + 1}]번째 - 취소사항 조회를 해주세요.`);
      return;
    }

    if (!await confirm(`${param.cntrNo}-${param.cntrSn}포함 총 ${cancelDetailList.value.length - 1}건의 취소를 저장하시겠습니까?`)) return;

    // 일괄 등록 시, 공통으로 적용할 파라미터 셋팅
    const firstOne = cancelDetailList.value[0];
    cancelDetailList.value.forEach((element) => {
      element.canCtrAmt = firstOne.canCtrAmt;
      element.slCtrRqrId = firstOne.slCtrRqrId;
      element.slCtrRmkCn = firstOne.slCtrRmkCn;
      element.cntrStatChRsonCd = firstOne.cntrStatChRsonCd;
      element.ccamExmptDvCd = firstOne.ccamExmptDvCd;
      element.csmbCsExmptDvCd = firstOne.csmbCsExmptDvCd;
      element.reqdCsExmptDvCd = firstOne.reqdCsExmptDvCd;
      element.reqdAkRcvryDvCd = firstOne.reqdAkRcvryDvCd;
      element.borAmt = firstOne.borAmt;
      element.lsnt = firstOne.lsnt;
      element.csmbCostBorAmt2 = firstOne.csmbCostBorAmt2;
      element.reqdCsBorAmt2 = firstOne.reqdCsBorAmt2;
      element.dscDdctam = firstOne.dscDdctam;
      element.filtDdctam = firstOne.filtDdctam;
      element.rsgAplcDt = firstOne.rsgAplcDt;
      element.rsgFshDt = firstOne.rsgFshDt;
      element.bulkApplyYN = 'Y';
    });

    saveList = cancelDetailList.value;
  } else {
    if (param.isSearch !== 'Y') {
      await notify('취소사항 조회를 해주세요.');
      return;
    }

    saveList.push(param);
  }

  // call service
  await dataService.post('/sms/wells/contract/changeorder/cancel-registrations', saveList);
  await notify(t('MSG_ALT_SAVE_DATA'));

  // 하위 초기화
  initComponent();

  await fetchData();
}

async function onUpdateValue() {
  // console.log(cancelDetailList.value[idx.value]);
}

async function getCanceledInfo(cntrNo, cntrSn, row) {
  const { dm } = searchParams.value;
  const res = await dataService.get('/sms/wells/contract/changeorder/cancel-infos', { params: { cntrNo, cntrSn, dm } });

  if (isEmpty(res.data)) {
    await notify(t('MSG_TXT_NO_DATA_FOUND'));
    return;
  }

  // 그리드 체크 초기화
  if (cancelDetailList.value.length > 0) {
    grdMainView.value.getDataSource().getRows().forEach((item, i) => {
      if (grdMainView.value.getValue(i, 'disableChk') === 'Y' && grdMainView.value.getValue(i, 'cancelStatNm') !== '취소등록') {
        grdMainView.value.setValue(i, 'disableChk', 'N');
      }
    });

    initComponent();
  }

  // set grid data
  cancelDetailList.value.push(grdMainView.value.getValues(row));

  // set searched data
  idx.value = 0;
  res.data.bulkApplyYN = 'N';
  Object.assign(cancelDetailList.value[idx.value], res.data);

  forceRender();
}

async function onClickSearch() {
  if (isEmpty(searchParams.value.cntrNo)
   && isEmpty(searchParams.value.cntrSn)
   && isEmpty(searchParams.value.cstNo)) {
    // 계약상세번호/고객번호 중 하나는 필수 항목 입니다.
    await alert(t('MSG_ALT_SRCH_CNDT_NEED_ONE_AMONG', [`${t('MSG_TXT_CNTR_DTL_NO')}, ${t('MSG_TXT_CST_NO')}`]));
    return false;
  }

  initComponent();
  cachedParams.value = cloneDeep(searchParams.value);

  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

function initGrid(data, view) {
  const columns = [
    { fieldName: 'cancelStatNm', header: t('MSG_TXT_CANCEL') + t('MSG_TXT_STT'), width: '100', styleName: 'text-center' }, // [취소상태]
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '88', styleName: 'text-center' }, // [판매유형]
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_CNTRCT_DT'), width: '88', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [계약일]
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      styleName: 'text-center',
      displayCallback: (g, i) => `${g.getValue(i.itemIndex, 'cntrNo')}-${g.getValue(i.itemIndex, 'cntrSn')}`,
    }, // [계약상세번호]
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CNTRT_TP'), width: '88', styleName: 'text-center' }, // [계약자유형]
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '88', styleName: 'text-center' }, // [고객번호]
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // [고객명]
    { fieldName: 'eotUcAmt', header: t('MSG_TXT_NPD_AMT'), width: '88', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '350' }, // [상품명]
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'sellTpCd', visible: false },
    { fieldName: 'sellTpDtlCd', visible: false },
    { fieldName: 'cntrDtlStatCd', visible: false },
    { fieldName: 'basePdCd', visible: false }, // [상품코드]
    { fieldName: 'cntrGbn', visible: false },
    { fieldName: 'ogCd', visible: false }, // [소속]
    { fieldName: 'hooPrtnrNm', visible: false }, // [본부장명]
    { fieldName: 'hooPrtnrNo', visible: false }, // [본부장사번]
    { fieldName: 'stplPtrm', visible: false }, // [의무기간]
    { fieldName: 'cntrPdStrtdt', visible: false }, // [매출년월 - 설치일자생성 시 들어감]
    { fieldName: 'cntrAmt', visible: false }, // [계약금액]
    { fieldName: 'rentalRgstCost', visible: false }, // [렌탈 등록비]
    { fieldName: 'cntramDscAmt', visible: false }, // [등록비 할인]
    { fieldName: 'cntrTam', visible: false }, // [약총액]
    { fieldName: 'pdBaseAmt', visible: false }, // [정상렌탈료]
    { fieldName: 'cntrPtrm', visible: false }, // [렌탈개월]
    { fieldName: 'fnlAmt', visible: false }, // [렌탈금액]
    { fieldName: 'dscAmt', visible: false }, // [렌탈할인금액]
    { fieldName: 'rstlPtrm', visible: false }, // [재약정개월]
    { fieldName: 'stplDscAmt', visible: false }, // [재약정할인금액]
    { fieldName: 'stplStrtdt', visible: false }, // [재약정기간 FROM]
    { fieldName: 'stplEnddt', visible: false }, // [재약정기간 TO]
    { fieldName: 'nomSlAmt', visible: false }, // [정상매출]
    { fieldName: 'rentalDc', visible: false }, // [렌탈일수]
    { fieldName: 'slDc', visible: false }, // [매출일수]
    { fieldName: 'chgDt', visible: false }, // [교체일자]
    { fieldName: 'spmtSlAmt', visible: false }, // [추가매출]
    { fieldName: 'nomDscAmt', visible: false }, // [정상할인]
    { fieldName: 'spmtDscAmt', visible: false }, // [추가할인]
    { fieldName: 'slCtrAmt', visible: false }, // [매출조정금액]
    { fieldName: 'thmSlSumAmt', visible: false }, // [매출금액]
    { fieldName: 'slSumVat', visible: false }, // [매출VAT]
    { fieldName: 'slAggAmt', visible: false }, // [매출누계]
    { fieldName: 'dscAggAmt', visible: false }, // [할인누계]
    { fieldName: 'ctrAggAmt', visible: false }, // [조정누계금액]
    { fieldName: 'thmPaiamAmt', visible: false }, // [당월원리금 - 등록때는 없음]
    { fieldName: 'thmSrvAmt', visible: false }, // [당월서비스 - 등록때는 없음]
    { fieldName: 'eotPcamBlam', visible: false }, // [매출잔액]
    { fieldName: 'addAmt', visible: false }, // [정기배송기기 - 추가]
    { fieldName: 'machineRentalAmt', visible: false }, // [정기배송 기기 렌탈료]
    { fieldName: 'recoverAmt', visible: false }, // [정기배송기기 원복 ]
    { fieldName: 'machineNm', visible: false }, // []
    { fieldName: 'lsnt', visible: false }, // [분실손료]
    { fieldName: 'sellAmt', visible: false },
    { fieldName: 'pkgYn', visible: false },
    { fieldName: 'cntrRcpDt', visible: false },
    { fieldName: 'cntrPdEnddt', visible: false },
    { fieldName: 'rentalTn', visible: false },
    { fieldName: 'sppTn', visible: false },
    { fieldName: 'svPrd', visible: false },
    { fieldName: 'svPdTpNm', visible: false },
    { fieldName: 'stlmTpNm', visible: false },
    { fieldName: 'sppDuedt', visible: false },
    { fieldName: 'sellPrtnrNo', visible: false },
    { fieldName: 'bulkApplyYN', visible: false },
    { fieldName: 'disableChk', visible: false },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.setCheckableExpression("(value['disableChk']<>'Y')", true);

  // click button
  view.onCellClicked = async (g, clickData) => {
    const { cntrNo, cntrSn, cntrDtlStatCd } = g.getValues(clickData.dataRow);
    if (cntrDtlStatCd.indexOf('3') === 0) {
      await getCanceledInfo(cntrNo, cntrSn, clickData.dataRow);
    }
  };
}
</script>

<style scoped lang="scss">
.kw-form-row + .kw-separator {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
