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

040621938
040535842
031005523
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
              required
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

          <kw-list
            separator
            item-padding="20px 0"
          >
            <!-- 2. 계약자 정보 --------------------------------------------------------------------------->
            <kw-expansion-item
              padding-target="header"
              expansion-icon-align="center"
              expand-icon-class="kw-font-pt24"
            >
              <template #header>
                <kw-item-section>
                  <kw-item-label>
                    <span class="text-weight-medium kw-font-pt18">2. {{ t('MSG_TXT_CNTRT_INF') }}</span>
                  </kw-item-label>
                </kw-item-section>
              </template>
              <div class="pb20">
                <kw-form cols="4">
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_CST_NM')">
                      <p>{{ cancelDetailList[idx].cntrCstKnm }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_SLS_CAT')">
                      <p>{{ cancelDetailList[idx].cntrGbn }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_GNR_MNG')">
                      <p>{{ cancelDetailList[idx].hooPrtnrNm }}({{ cancelDetailList[idx].hooPrtnrNo }})</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_BLG')">
                      <p>{{ cancelDetailList[idx].ogCd }}</p>
                    </kw-form-item>
                  </kw-form-row>
                </kw-form>
              </div>
            </kw-expansion-item>

            <!-- 3. 계약상품 --------------------------------------------------------------------------->
            <kw-expansion-item
              padding-target="header"
              expansion-icon-align="center"
              expand-icon-class="kw-font-pt24"
            >
              <template #header>
                <kw-item-section>
                  <kw-item-label>
                    <span class="text-weight-medium kw-font-pt18">3. {{ t('MSG_TXT_CNTR_PD') }}</span>
                  </kw-item-label>
                </kw-item-section>
              </template>
              <div class="pb20">
                <kw-form
                  cols="4"
                >
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_PD_INF')">
                      <p>{{ cancelDetailList[idx].basePdCd }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_DUTY')">
                      <p>{{ cancelDetailList[idx].stplPtrm }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_CNTR_DATE')">
                      <p>{{ stringUtil.getDateFormat(cancelDetailList[idx].cntrCnfmDt) }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_SL_DT')">
                      <p>{{ stringUtil.getDateFormat(cancelDetailList[idx].cntrPdStrtdt) }}</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-separator />
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_REG_FEE')">
                      <p>{{ stringUtil.getNumberWithComma(cancelDetailList[idx].cntrAmt??'') }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_RGST_COST_DSC')">
                      <p>{{ stringUtil.getNumberWithComma(cancelDetailList[idx].cntramDscAmt??'') }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_RNTL_TOTAL')">
                      <p>{{ stringUtil.getNumberWithComma(cancelDetailList[idx].cntrTam??'') }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_NOM')+$t('MSG_TXT_RTLFE')">
                      <p>({{ stringUtil.getNumberWithComma(cancelDetailList[idx].pdBaseAmt??'') }})</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-separator />
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_RENTAL')+$t('MSG_TXT_MCNT')+'/'+$t('MSG_TXT_AMT')">
                      <p>
                        {{ cancelDetailList[idx].cntrPtrm }}개월 /
                        {{ stringUtil.getNumberWithComma(cancelDetailList[idx].fnlAmt??'') }}
                      </p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_RENTAL')+' DC'">
                      <p>{{ stringUtil.getNumberWithComma(cancelDetailList[idx].dscAmt??'') }}</p>
                    </kw-form-item>
                  </kw-form-row>
                  <kw-separator />
                  <kw-form-row>
                    <kw-form-item :label="$t('MSG_TXT_RSTL')+$t('MSG_TXT_MCNT')">
                      <p>{{ cancelDetailList[idx].rstlPtrm }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_RSTL')+$t('MSG_TXT_DSC')">
                      <p>{{ stringUtil.getNumberWithComma(cancelDetailList[idx].stplDscAmt??'') }}</p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_RSTL')+$t('MSG_TXT_PRD')">
                      <p>
                        {{ stringUtil.getDateFormat(cancelDetailList[idx].stplStrtdt) }}
                        ~
                        {{ stringUtil.getDateFormat(cancelDetailList[idx].stplEnddt) }}
                      </p>
                    </kw-form-item>
                    <kw-form-item :label="$t('MSG_TXT_CNTRCT_AMT')">
                      <p>{{ stringUtil.getNumberWithComma(cancelDetailList[idx].cntrTam??'') }}</p>
                    </kw-form-item>
                  </kw-form-row>
                </kw-form>
              </div>
            </kw-expansion-item>
          </kw-list>

          <component
            :is="detailPanels[panelIdx].panel"
            ref="detailPanel"
            :child-detail="cancelDetailList[idx]"
            @savedetail="onSave"
            @removedetail="onDelete"
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
import { getComponentType, gridUtil, stringUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';

import WwctbRentalCancelRegistrationMgtM from './WwctbRentalCancelRegistrationMgtM.vue';
import WwctbRegularShippingCancelRegistrationMgtM from './WwctbRegularShippingCancelRegistrationMgtM.vue';
import WwctbSinglePaymentCancelRegistrationMgtM from './WwctbSinglePaymentCancelRegistrationMgtM.vue';
import WwctbMembershipCancelRegistrationMgtM from './WwctbMembershipCancelRegistrationMgtM.vue';

const { t } = useI18n();
const { modal, alert, notify } = useGlobal();
const dataService = useDataService();
const grdMain = ref(getComponentType('KwGrid'));
const grdMainView = computed(() => grdMain.value?.getView());

const searchParams = ref({
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  dm: '', // 조회년월
});

const totalCount = ref(0);
const cachedParams = ref({});

const idx = ref(0);
const cancelDetailList = ref([]);

const detailPanel = ref(); // 현금영수증 탭
/// const panelIdx = computed(() => idx.value);
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
];

function getPanelIdx(val) {
  switch (val) {
    case '1': return 2;
    case '3': return 3;
    case '6': return 1;
    default: return 0;
  }
}
const panelIdx = computed(() => getPanelIdx(cancelDetailList.value[idx.value].sellTpCd));

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
async function onClickSearchCst() {
  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
  });
  if (result) {
    searchParams.value.cstNo = payload.cstNo;
  }
}

function setGridCheckandSelect(row, isCheck) {
  grdMainView.value.setValue(row, 'isAdded', isCheck ? 'Y' : '');
  grdMainView.value.setCheckable(row, !isCheck);

  if (isCheck) {
    if (cancelDetailList.value.findIndex((v) => v.cntrNo === grdMainView.value.getValue(row, 'cntrNo') && v.cntrSn === grdMainView.value.getValue(row, 'cntrSn')) >= 0) {
      notify(`${grdMainView.value.getValue(row, 'cntrNo')}-${grdMainView.value.getValue(row, 'cntrSn')}은 이미 등록되었습니다.`);
    } else {
      cancelDetailList.value.push(grdMainView.value.getValues(row));
    }
  } else {
    const isLast = ((idx.value + 1) === cancelDetailList.value.length);
    cancelDetailList.value.splice(idx.value, 1);

    if (isLast) {
      idx.value += -1;
    }
  }
}

// 1. 계약리스트 > 선택건 취소등록 클릭
function onClickRegistCancel() {
  if (isEmpty(grdMainView.value.getCheckedRows())) {
    notify(t('MSG_ALT_LIST_CHO'));
    return;
  }

  grdMainView.value.getCheckedRows().forEach((i) => {
    if (grdMainView.value.getValue(i, 'isAdded') === 'Y') {
      return true;
    }

    setGridCheckandSelect(i, true);
    grdMainView.value.checkItem(i, false);
  });

  grdMainView.value.setAllCheck(false);
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

// summary > 좌/우 이동 클릭
function onClickMove(pDiv) {
  if (pDiv === 'L') {
    idx.value = (idx.value > 0) ? (idx.value - 1) : idx.value;
  } else {
    idx.value = (idx.value < cancelDetailList.value.length) ? (idx.value + 1) : idx.value;
  }
}

async function onSave(param) {
  console.log('onSave');

  // 취소등록 정보 일괄적용 : 같은 판매유형의 취소등록건의 정보를 일괄적용
  if (param.bulkApplyYN === 'Y') {
    if (cancelDetailList.value.findIndex((v) => v.sellTpCd !== param.sellTpCd) >= 0) {
      notify('다른유형 존재');
    } else {
      notify('취소등록 정보 일괄적용 : 같은 판매유형의 취소등록건의 정보를 일괄적용하여 처리 합니다.');
    }
  }
}

async function onDelete() {
  const { cntrNo, cntrSn } = cancelDetailList.value[idx.value];
  const row = gridUtil.findDataRow(grdMainView.value, (e) => ((e.cntrNo === cntrNo) && (e.cntrSn === cntrSn)));

  setGridCheckandSelect(row, false);
}

async function fetchData() {
  if (isEmpty(cachedParams.value)) return;

  const res = await dataService.get('/sms/wells/contract/changeorder/cancel-base-infos', { params: { ...cachedParams.value } });

  totalCount.value = res.data.length;
  grdMainView.value.getDataSource().setRows(res.data.map((obj) => ({ ...obj, bulkApplyYN: 'N' })));
  grdMainView.value.getDataSource().checkRowStates(false);
}

async function onClickSearch() {
  if (isEmpty(searchParams.value.cntrNo)
   && isEmpty(searchParams.value.cntrSn)
   && isEmpty(searchParams.value.cstNo)) {
    // 계약상세번호/고객번호 중 하나는 필수 항목 입니다.
    await alert(t('MSG_ALT_SRCH_CNDT_NEED_ONE_AMONG', [`${t('MSG_TXT_CNTR_DTL_NO')}, ${t('MSG_TXT_CST_NO')}`]));
    return false;
  }
  cachedParams.value = cloneDeep(searchParams.value);

  await fetchData();
}

onMounted(() => {
  // onClickSearch();

});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

function initGrid(data, view) {
  const columns = [
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' }, // [판매유형]
    { fieldName: 'cntrCnfmDt', header: t('MSG_TXT_CNTRCT_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // [계약일]
    { fieldName: 'cntrNoSn',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '120',
      styleName: 'text-center',
      displayCallback: (g, i) => `${g.getValue(i.itemIndex, 'cntrNo')}-${g.getValue(i.itemIndex, 'cntrSn')}`,
    }, // [계약상세번호]
    { fieldName: 'copnDvNm', header: t('MSG_TXT_CNTRT_TP'), width: '100', styleName: 'text-center' }, // [계약자유형]
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '100', styleName: 'text-center' }, // [고객번호]
    { fieldName: 'cntrCstKnm', header: t('MSG_TXT_CST_NM'), width: '120', styleName: 'text-center' }, // [고객명]
    { fieldName: 'npdAmt', header: t('MSG_TXT_NPD_AMT'), width: '100', styleName: 'text-right', dataType: 'number' },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '270' }, // [상품명]
    { fieldName: 'cntrGbn', visible: false },
    { fieldName: 'hooPrtnrNm', visible: false },
    { fieldName: 'hooPrtnrNo', visible: false },
    { fieldName: 'ogCd', visible: false },
    { fieldName: 'basePdCd', visible: false },
    { fieldName: 'stplPtrm', visible: false },
    { fieldName: 'cntrPdStrtdt', visible: false },
    { fieldName: 'cntrAmt', visible: false },
    { fieldName: 'cntramDscAmt', visible: false },
    { fieldName: 'cntrTam', visible: false },
    { fieldName: 'pdBaseAmt', visible: false },
    { fieldName: 'cntrPtrm', visible: false },
    { fieldName: 'fnlAmt', visible: false },
    { fieldName: 'dscAmt', visible: false },
    { fieldName: 'rstlPtrm', visible: false },
    { fieldName: 'stplDscAmt', visible: false },
    { fieldName: 'stplStrtdt', visible: false },
    { fieldName: 'stplEnddt', visible: false },
    { fieldName: 'nomSlAmt', visible: false },
    { fieldName: 'rentalDc', visible: false },
    { fieldName: 'slDc', visible: false },
    { fieldName: 'chgDt', visible: false },
    { fieldName: 'spmtSlAmt', visible: false },
    { fieldName: 'nomDscAmt', visible: false },
    { fieldName: 'canAtrAmt', visible: false },
    { fieldName: 'addSrv', visible: false },
    { fieldName: 'spmtDscAmt', visible: false },
    { fieldName: 'slCtrAmt', visible: false },
    { fieldName: 'thmSlSumAmt', visible: false },
    { fieldName: 'slSumVat', visible: false },
    { fieldName: 'slAggAmt', visible: false },
    { fieldName: 'thmPaiamAmt', visible: false },
    { fieldName: 'thmSrvAmt', visible: false },
    { fieldName: 'eotPcamBlam', visible: false },
    { fieldName: 'btdDlqAddAmt', visible: false },
    { fieldName: 'thmDlqAddDpSumAmt', visible: false },
    { fieldName: 'thmDlqAddRfndSumAmt', visible: false },
    { fieldName: 'eotDlqAmt', visible: false },
    { fieldName: 'sellTpCd', visible: false },
    { fieldName: 'cntrNo', visible: false },
    { fieldName: 'cntrSn', visible: false },
    { fieldName: 'isAdded', width: '30' },
    { fieldName: 'bulkApplyYN', width: '30' },
  ];
  const fields = columns.map(({ fieldName, dataType }) => (dataType ? { fieldName, dataType } : { fieldName }));

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
}
</script>

<style scoped lang="scss">
.kw-form-row + .kw-separator {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
