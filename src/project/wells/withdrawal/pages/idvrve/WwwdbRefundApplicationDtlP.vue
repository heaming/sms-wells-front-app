<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : withdrawal/idvrve
2. 프로그램 ID :  WwwdbRefundApplicationDtlP - 환불 신청 상세 내역 팝업 W-WD-U-0108P03
3. 작성자 : sonkiseok -> kimoon.lim(gs.piit216)
4. 작성일 : 2023.05.19
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- PGE_WDB_00063
- 수납 > 환불업무 > 환불신청 관리 > 그리드에서 환불상세 클릭
- 환불신청상세 내역을 조회 합니다.
****************************************************************************************************
--->
<template>
  <kw-popup
    ref="popupRef03"
    size="3xl"
  >
    <kw-action-top class="mb20">
      <template #left>
        <h3>신청정보</h3>
      </template>
      <!-- 컨텍이력조회 -->
      <kw-btn
        :label="$t('MSG_BTN_CTT_HIS_INQR')"
        secondary
        dense
        @click="onClickContect"
      />
    </kw-action-top>
    <kw-grid
      ref="grdPopRef"
      name="grdPop"
      :visible-rows="1"
      @init="initGrid"
    />
    <h3 class="mb20">
      <!-- 계약상세 -->
      {{ $t('MSG_TXT_CNTR_DTL') }}
    </h3>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo1.pageIndex"
          v-model:page-size="pageInfo1.pageSize"
          :total-count="pageInfo1.totalCount"
          @change="fetchData"
        />
        <!-- 단위: 원-->
        <span class="ml8"> {{ $t('MSG_TXT_UNIT_WON') }}</span>
      </template>
      <!-- 엑셀다운로드-->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo1.totalCount=== 0"
        @click="onClickExcel1"
      />
    </kw-action-top>
    <kw-grid
      ref="grdPopRef1"
      name="grdPop1"
      :visible-rows="pageInfo1.pageSize"
      @init="initGrid1"
    />

    <ul class="kw-notification mt20">
      <li>
        <!-- 환불가능금액 = 입금액-월납입금-연체가산금-위약금-서비스금액 -->
        {{ $t('MSG_TXT_NOTI_REFUND_AMT') }}
      </li>
    </ul>

    <kw-separator />

    <h3 class="mb20">
      <!-- 환불상세 -->
      {{ $t('MSG_TXT_RFND_DTL') }}
    </h3>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          v-model:page-index="pageInfo2.pageIndex"
          v-model:page-size="pageInfo2.pageSize"
          :total-count="pageInfo2.totalCount"
          @change="fetchData"
        />
        <!-- 단위: 원-->
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        <kw-separator
          spaced
          vertical
          inset
        />
        <p>
          <!-- 총 -->
          <span class="kw-fc--black3"> {{ $t('MSG_TXT_COM_TOT') }}</span>
          <span class="ml4 text-weight-bold">
            {{ stringUtil.getNumberWithComma(totRfndAkAmt) }} {{ $t('MSG_TXT_CUR_WON') }}
          </span>
        </p>
      </template>
      <!-- 엑셀다운로드 -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo2.totalCount===0"
        @click="onClickExcel2"
      />
    </kw-action-top>
    <kw-grid
      ref="grdPopRef2"
      name="grdPop2"
      :visible-rows="5"
      @init="initGrid2"
    />

    <h3>
      <!-- 환불정보 -->
      {{ $t('MSG_TXT_RFND_INF') }}
    </h3>

    <kw-form
      :cols="2"
      class="mt30"
    >
      <kw-form-row>
        <!-- 환불구분-->
        <kw-form-item :label="$t('MSG_TXT_CLSF_REFUND')">
          <kw-checkbox
            v-model="saveParams.arfndYn"
            :false-value="N"
            :true-value="Y"
            :label="$t('MSG_TXT_PPYM_RFND')"
            @update:model-value="onClickArfndYn"
          />
          <!-- v-model="searchParams.check" -->
        </kw-form-item>
        <!-- 지급은행 -->
        <kw-form-item
          :label="$t('MSG_TXT_DSB_BNK')"
          required
        >
          <kw-select
            v-model="saveParams.bankCode"
            :options="codes.CSH_RFND_FNIT_CD"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계좌번호 -->
        <kw-form-item
          :label="$t('MSG_TXT_AC_NO')"
          required
        >
          <kw-input
            v-model="saveParams.acnoEncr"
            regex="num"
            @change="saveParams.cstNm=''"
          />
          <!-- 호출되는 값이 16자 초과하면안되게 되어있음.-->
        </kw-form-item>
        <!-- 예금주 -->
        <kw-form-item
          :label="$t('MSG_TXT_ACHLDR')"
          required
        >
          <kw-input
            v-model="saveParams.cstNm"
            :label="$t('MSG_TXT_ACHLDR')"
            rules="required"
            readonly
          />
          <!-- 유효성체크 -->
          <kw-btn
            secondary
            :label="$t('MSG_BTN_EFTN_CHECK')"
            rules="required"
            class="px12"
            @click="onClickEftnCheck"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3 class="mb20">
      <!-- 전금상세 -->
      {{ $t('MSG_TXT_BLTF_DTL') }}
    </h3>

    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="pageInfo3.totalCount"
        />
        <!-- (단위:원) -->
        <span class="ml8">{{ $t('MSG_TXT_UNIT_WON') }}</span>
        <kw-separator
          spaced
          vertical
          inset
        />
        <p>
          <!-- 총 -->
          <span class="kw-fc--black3">{{ $t('MSG_TXT_COM_TOT') }}</span>
          <span class="ml4 text-weight-bold">
            {{ stringUtil.getNumberWithComma(totBltfAkAmt) }} {{ $t('MSG_TXT_CUR_WON') }}
          </span>
        </p>
      </template>
      <!-- 삭제 -->
      <!-- <kw-btn
        :label="$t('MSG_BTN_DEL')"
        grid-action
        @click="onClickRfndDelete"
      /> -->
      <!-- <kw-separator
        spaced
        vertical
        inset
      /> -->
      <!-- 엑셀다운로드 -->
      <kw-btn
        icon="download_on"
        dense
        secondary
        :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        :disable="pageInfo3.totalCount===0"
        @click="onClickExcel3"
      />
    </kw-action-top>
    <kw-grid
      ref="grdPopRef3"
      name="grdPop3"
      :visible-rows="5"
      @init="initGrid3"
    />

    <kw-action-top class="mt30">
      <template #left>
        <!-- 환불접수총액-->
        <h3>{{ $t('MSG_TXT_RFND_RCP_TAM') }}</h3>
      </template>
      <!-- 단위:원 -->
      <span class="kw-fc--black3 text-weight-regular">{{ $t('MSG_TXT_UNIT_WON') }}</span>
    </kw-action-top>
    <kw-grid
      ref="grdPopRef4"
      name="grdPop4"
      :visible-rows="1"
      @init="initGrid4"
    />

    <h3 class="mb20">
      <!-- 처리정보 -->
      {{ $t('MSG_TXT_PCS_INF') }}
    </h3>
    <kw-observer ref="obsRef">
      <kw-form>
        <kw-form-row>
          <!-- 수납일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_RVE_DT')"
            required
          >
            <kw-date-picker
              v-model="saveParams.rveDt"
              :label="$t('MSG_TXT_RVE_DT')"
              rules="required"
            />
          </kw-form-item>
          <!-- 실적일자 -->
          <kw-form-item
            :label="$t('MSG_TXT_PERF_DT')"
            required
          >
            <kw-date-picker
              v-model="saveParams.perfDt"
              :label="$t('MSG_TXT_PERF_DT')"
              rules="required"
            />
          </kw-form-item>
          <!-- 지급일자-->
          <kw-form-item
            required
            :label="$t('MSG_TXT_DSB_DT')"
          >
            <kw-date-picker
              v-model="saveParams.dsbDt"
              :min-date="minDate"
              :disable="arfndYnChk"
              :label="$t('MSG_TXT_DSB_DT')"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 처리구분 -->
          <kw-form-item
            :label="$t('MSG_TXT_PROCS_DV')"
            required
          >
            <kw-select
              v-model="saveParams.procsDv"
              :label="$t('MSG_TXT_PROCS_DV')"
              :options="codes.RFND_AK_STAT_CD.filter((v) => v.codeId === '03' || v.codeId === '99')"
              rules="required"
            />
          </kw-form-item>
          <!-- 처리내용 -->
          <kw-form-item
            :label="$t('MSG_TXT_PROCS_CN')"
            colspan="2"
          >
            <kw-input
              v-model="saveParams.procsCn"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </kw-observer>
    <template #action>
      <!-- 저장 -->
      <kw-btn
        primary
        :label="$t('MSG_BTN_SAVE')"
        :disable="props.rfndAkStatCd==='03'"
        @click="onClickSave"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
import { codeUtil, useGlobal, useMeta, defineGrid, getComponentType, gridUtil, useDataService, fileUtil, modal, useModal, stringUtil } from 'kw-lib';
// eslint-disable-next-line no-unused-vars
import { isEqual, isEmpty, cloneDeep } from 'lodash-es';
// eslint-disable-next-line no-unused-vars
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
// eslint-disable-next-line no-unused-vars
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import dayjs from 'dayjs';

const { currentRoute } = useRouter();
const now = dayjs();
const { confirm } = useGlobal();

const props = defineProps({
  rfndAkStatCd: {
    type: String,
    default: null,
  },

  cntrNo: {
    type: String,
    default: null,
  },
  cntrSn: {
    type: String,
    default: null,
  },
  rfndAkNo: {
    type: String,
    default: null,
  },
  fnlMdfcUsrNm: {
    type: String,
    default: null,
  },
  fnlMdfcUsrId: {
    type: String,
    default: null,
  },
  rfndAkDtm: {
    type: String,
    default: null,
  },
});

const pageInfo1 = ref({ // 계약상세 페이지1
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
  // pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});
const pageInfo2 = ref({ // 환불상세 페이지
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
  // pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

// eslint-disable-next-line no-unused-vars
const pageInfo3 = ref({ // 전금상세 페이지
  totalCount: 0,
  pageIndex: 1,
  pageSize: 5,
  // pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const { notify } = useGlobal();
const { t } = useI18n();

// eslint-disable-next-line no-unused-vars
const popupRef01 = ref(); //
const grdPopRef = ref(getComponentType('KwGrid'));
const grdPopRef1 = ref();
const grdPopRef2 = ref();
const grdPopRef3 = ref();
const grdPopRef4 = ref();
const obsRef = ref();
const arfndYnChk = ref(false);
const minDate = ref();
const dataService = useDataService();
const { ok } = useModal();

const saveParams = ref({
  arfndYn: 'Y', // 선환불정보
  acnoEncr: '', // 계좌번호
  bankCode: '', // fnitCd(은행코드)
  cstNm: '', // 예금주

  /* 처리정보(환불정보) */
  rveDt: now.format('YYYYMMDD'),
  perfDt: now.format('YYYYMMDD'),
  dsbDt: now.add(2, 'd').format('YYYYMMDD'),
  procsDv: '03',
  procsCn: '',
  rfndAkNo: '',
});

// eslint-disable-next-line no-unused-vars
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS', //
  'CSH_RFND_FNIT_CD', // 은행코드
  /* 계약상세 */
  'COPN_DV_CD', // 고객유형: 1.개인, 2.법인
  'SELL_TP_CD', // 판매유형

  /* 환불상세 */
  'DP_MES_CD', /* 입금수단코드 */
  'DP_TP_CD', /* 입금유형코드 */
  'RFND_RSON_CD', /* 환불사유코드 */

  /* 전금상세 */
  'BLTF_RFND_MB_DV_CD',

  /* 처리구분(환불구분) */
  'RFND_AK_STAT_CD', // 환불구분
  'RVE_DV_CD', // 수납구분코드
);

let cachedParams;
let totRfndAkAmt = 0;
let totBltfAkAmt = 0;
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function onClickContect() {
  const { cntrNo } = props;
  await modal({
    component: 'WwwdbRefundApplicationConnectHistoryP',
    componentProps: { cntrNo }, // 템플릿을 그리드 기준으로 작성해서 만듬
  });
}

async function onValidRfndCheck() {
  if (saveParams.value.bankCode === '') {
    notify(t('환불정보:은행정보가 비어있습니다.'));
    return false;
  }

  if (saveParams.value.acnoEncr === '') {
    notify(t('환불정보:계좌번호가 비어있습니다.'));
    return false;
  }
  return true;
}

async function fetchData() {
  const res3 = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/balance-transfer', { params: { ...cachedParams, ...pageInfo1.value } });
  const { list: app3, pageInfo: pagingResult3 } = res3.data;

  const res2 = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/refund-detail', { params: { ...cachedParams, ...pageInfo1.value } });
  const { list: app2, pageInfo: pagingResult2 } = res2.data;

  const res1 = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/paging', { params: { ...cachedParams, ...pageInfo1.value } });
  const { list: app1, pageInfo: pagingResult1 } = res1.data;

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/refund', { params: { ...cachedParams } });

  saveParams.value.arfndYn = res.data.arfndYn;
  saveParams.value.acnoEncr = res.data.cshRfndAcnoEncr;
  saveParams.value.bankCode = res.data.cshRfndFnitCd;
  saveParams.value.cstNm = isEmpty(res.data.cshRfndAcownNm) ? '' : res.data.cshRfndAcownNm;
  saveParams.value.rveDt = isEmpty(res.data.rfndRveDt) ? now.format('YYYYMMDD') : res.data.rfndRveDt;
  saveParams.value.perfDt = isEmpty(res.data.rfndPerfDt) ? now.format('YYYYMMDD') : res.data.rfndPerfDt;
  saveParams.value.dsbDt = isEmpty(res.data.rfndDsbDt) ? now.format('YYYYMMDD') : res.data.rfndDsbDt;
  saveParams.value.procsDv = isEmpty(res.data.rfndProcsDvCd) ? '03' : res.data.rfndProcsDvCd;
  saveParams.value.procsCn = res.data.rfndProcsCn;

  pageInfo3.value = pagingResult3;
  pageInfo2.value = pagingResult2;
  pageInfo1.value = pagingResult1;

  const view1 = grdPopRef1.value.getView();
  view1.checkBar.visible = false;

  view1.getDataSource().setRows(app1);
  const view2 = grdPopRef2.value.getView();
  view2.getDataSource().setRows(app2);
  const view3 = grdPopRef3.value.getView();
  view3.getDataSource().setRows(app3);

  // eslint-disable-next-line no-use-before-define
  await onCheckTotalData(); // 그리드4 (총액 자동계산)
  // eslint-disable-next-line no-use-before-define
  await onEditRfnd(props.cntrNo);
}

// 계약상세 엑셀다운로드
/**
 * TODO: 계약상세 그리드 외에 그리드는 검색조건에 의한 결과가 아니므로 일반 엑셀다운로드를 사용함.
 * 필요한경우 서비스 생성요함.
 */
async function onClickExcel1() {
  const view = grdPopRef1.value.getView();

  if (props.rfndAkNo) {
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
    });
  } else {
    const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/excel-download', { params: cachedParams });
    await gridUtil.exportView(view, {
      fileName: currentRoute.value.meta.menuName,
      timePostfix: true,
      exportData: res.data,
    });
  }
}
// 환불상세 다운로드
async function onClickExcel2() {
  const view = grdPopRef2.value.getView();
  // eslint-disable-next-line max-len
  // const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/excel-download', { params: cachedParams });
  // await gridUtil.exportView(view, {
  //   fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_RFND_DTL')}`,
  //   timePostfix: true,
  //   exportData: res.data,
  // });
  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_RFND_DTL')}`,
    timePostfix: true,
  });
}

async function onClickArfndYn() {
  const { arfndYn } = saveParams.value;

  if (arfndYn === 'Y') {
    saveParams.value.dsbDt = now.format('YYYYMMDD');
    arfndYnChk.value = true;
  } else {
    const date = now.add(2, 'd').format('YYYYMMDD');
    saveParams.value.dsbDt = date;
    minDate.value = now.add(2, 'd').format('YYYY-MM-DD');
    arfndYnChk.value = false;
  }
}

// 전금상세 다운로드
async function onClickExcel3() {
  const view = grdPopRef3.value.getView();
  // eslint-disable-next-line max-len
  // const res = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/excel-download', { params: cachedParams });
  // await gridUtil.exportView(view, {
  //   fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_BLTF_DTL')}`,
  //   timePostfix: true,
  //   exportData: res.data,
  // });

  await gridUtil.exportView(view, {
    fileName: `${currentRoute.value.meta.menuName}_${t('MSG_TXT_BLTF_DTL')}`,
    timePostfix: true,
  });
}

// 유효성체크 (해당 데이터는 임시데이터)
async function onClickEftnCheck() {
  if (!await onValidRfndCheck()) { return false; }
  const view = grdPopRef1.value.getView();

  const cntrNo = view.getValue(0, 'cntrNo');
  const cntrSn = view.getValue(0, 'cntrSn');
  const sendData = {
    cntrNo,
    cntrSn,
    bnkCd: saveParams.value.bankCode,
    acno: saveParams.value.acnoEncr,
    copnDvDrmVal: '000101',
    achldrNm: '예금주',
    copnDvCd: '1',
    sysDvCd: 'W',
    psicId: '',
    deptId: '',
  };
  const acnoData = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/bank-effective', { params: sendData });
  saveParams.value.cstNm = acnoData.data.ACHLDR_NM;
}

// async function onCheckValidate2() {
//   const view2 = grdPopRef2.value.getView();
//   if (!await gridUtil.validate(view2)) { return false; } // 유효성 검사
//   return view2;
// }
// async function onCheckValidate3() {
//   const view3 = grdPopRef3.value.getView();
//   if (pageInfo3.value.totalCount > 0) {
//     if (!await gridUtil.validate(view3)) { return false; } // 유효성 검사
//   }
//   return view3;
// }
// async function cntrValidateView3() {
//   let flag = true;
//   const view3 = grdPopRef3.value.getView();
//   const allView3 = gridUtil.getAllRowValues(view3);

//   for (let i = 0; i < allView3.length; i += 1) {
//     for (let j = i + 1; j < allView3.length; j += 1) {
//       if (allView3[i].bltfOjCntrDtlNo === allView3[j].bltfOjCntrDtlNo
//            && allView3[i].bltfOjCntrDtlSn === allView3[j].bltfOjCntrDtlSn) {
//         flag = false;
//         // 1. 동일한 전금계약번호가 존재하는경우 (토스트 메시지)
//       }
//     }
//   }
//   return flag;
// }

// async function onClickRefundAsk(stateCode) {
//   const view1 = grdPopRef1.value.getView();
//   const view2 = await onCheckValidate2();
//   const view3 = await onCheckValidate3();
//   const view4 = grdPopRef4.value.getView();

//   /* TODO: 로컬테스트시, 여기부터 */
//   if (!await onValidRfndCheck()) {
//     return false;
//   }
//   if (saveParams.value.cstNm === '' || saveParams.value.cstNm.trim().length === 0) {
//     notify(t('MSG_ALT_AC_INF_ACHLDR_NM_ERR')); // 입력하신 계좌정보 및 예금주명을 다시 확인해 주세요.(예금주가 없음.)
//     return false;
//   }

//   if (!await cntrValidateView3()) {
//     // 계약번호 - 전금계약번호가 동일하거나 , 전금계약상 데이터에 전금계약번호가 동일한경우.
//     notify(t('동일한 전금계약번호가 존재합니다.'));
//     return false;
//   }

//   if (pageInfo1.value.totalCount < 1) {
//     notify(t('MSG_TXT_NO_DATA_RM')); // 조회결과가 없습니다. (검색안했을경우 또는 검색결과없는경우);
//     return false;
//   }

//   if (saveParams.value.rveDt === ''
//    || saveParams.value.perfDt === ''
//    || saveParams.value.procsDv === '') {
//     await notify(t('MSG_ALT_INPUT_COMMON', [t('MSG_TXT_PCS_INF')])); // 처리정보를 입력하세요
//     return false;
//   }

//   const changedRows2 = gridUtil.getChangedRowValues(view2); // 환불상세 그리드 데이터
//   const changedRows3 = gridUtil.getChangedRowValues(view3); // 전금상세 그리드 체크 데이터
//   const changedRows4 = gridUtil.getChangedRowValues(view4); // 환불접수총액

//   if (changedRows4[0].totRfndEtAmt === 0) {
//     notify(t('MSG_TXT_NO_DATA_FOUND')); // 데이터가 없습니다. (환불요청내역이없을때(0원일시))
//     return false;
//   }

//   const checkedRows1 = gridUtil.getCheckedRowValues(view1);
//   checkedRows1.forEach((element) => {
//     element.rfndAkNo = props.rfndAkNo;
//   });

//   const params = {
//     saveBaseReq: {
//       kwGrpCoCd: '2000',
//       rfndAkNo: props.rfndAkNo,
//       arfndYn: saveParams.value.arfndYn,
//       cshRfndFnitCd: saveParams.value.bankCode,
//       cshRfndAcnoEncr: saveParams.value.acnoEncr,
//       cshRfndAcownNm: saveParams.value.cstNm,
//       rfndCshAkSumAmt: changedRows4[0].rfndCshAkAmt,
//       rfndCardAkSumAmt: changedRows4[0].rfndCardAkAmt,
//       rfndBltfAkSumAmt: changedRows4[0].totRfndBltfAkAmt,
//       crdcdFeeSumAmt: changedRows4[0].totCrdcdFeeAmt,
//       rfndAkStatCd: stateCode,
//       rfndAkPrtnrNo: '',
//       //  rfndProcsDvCd,
//       /* 환불요청기본 추가 될 테이블  */
//       rveDt: saveParams.value.rveDt,
//       perfDt: saveParams.value.perfDt,
//       dsbDt: saveParams.value.dsbDt,
//       rfndProcsDvCd: saveParams.value.procsDv,
//       rfndProcsCn: saveParams.value.procsCn,

//     },
//     saveCntrReqs: checkedRows1,
//     saveDtlReqs: changedRows2,
//     saveBltfReqs: changedRows3,
//   };
//   await dataService.post('/sms/wells/withdrawal/idvrve/refund-applications/reg/save', params);
//   notify(t('MSG_ALT_SAVE_DATA'));
//   ok();
// }

async function onSaveValidation() {
  if (!await obsRef.value.validate()) { return false; }

  return true;
}

async function onClickSave() {
  // await onClickRefundAsk(saveParams.value.procsDv);
  if (!await onSaveValidation()) { return false; }

  if (!await confirm('저장하시겠습니까?')) { return false; }

  const view2 = grdPopRef2.value.getView();
  const view3 = grdPopRef2.value.getView();

  const changedRows2 = gridUtil.getAllRowValues(view2); // 환불상세 그리드 데이터
  const changedRows3 = gridUtil.getAllRowValues(view3); // 전금상세 그리드 체크 데이터

  const saveParam = {
    saveBaseReq: cloneDeep(saveParams.value),
    saveDtlReqs: changedRows2, // 환불상세 그리드 데이터
    saveBltfReqs: changedRows3, // 전금상세 그리드 데이터
  };

  await dataService.post('/sms/wells/withdrawal/idvrve/refund-applications/reg/approval', saveParam);
  ok();
}

onMounted(async () => {
  const data = [{
    totRfndCshAkAmt: 0,
    totRfndCardAkAmt: 0,
    totRfndBltfAkAmt: 0,
    totCrdcdFeeAmt: 0,
    totRfndEtAmt: 0,
  }];
  grdPopRef4.value.getView().getDataSource().setRows(data);

  const view1 = grdPopRef.value.getView();
  gridUtil.insertRowAndFocus(view1, 0, {
    fnlMdfcUsrNm: props.fnlMdfcUsrNm,
    fnlMdfcUsrId: props.fnlMdfcUsrId,
    rfndAkDtm: props.rfndAkDtm,
    rfndAkStatCd: props.rfndAkStatCd,
  });
  // 자동 조회
  cachedParams = {
    // cntrNo: props.cntrNo,
    // cntrSn: props.cntrSn,
    rfndAkNo: props.rfndAkNo,
    rfndAkStatCd: props.rfndAkStatCd,
  };

  saveParams.value.rfndAkNo = props.rfndAkNo;
  await fetchData();
  onClickArfndYn();
});
/** ****************환불상세 function *********************** */

// 단일행추가
async function insertMainData(cntrNo, cntrSn) {
  let dataParams = {
    cntrNo,
    cntrSn,
  };
  dataParams = { ...dataParams, ...pageInfo2.value };

  const rfndRes = await dataService.get('/sms/wells/withdrawal/idvrve/refund-applications/reg/refund-detail', { params: dataParams });
  const { list: application, pageInfo: pagingResult } = rfndRes.data;
  pageInfo2.value = pagingResult;
  const view2 = grdPopRef2.value.getView();
  view2.getDataSource().addRows(application);
}

// 단일행삭제
async function removeMainData(view2, view3, cntrDtlNo, dpDt) {
  const allValues2 = gridUtil.getAllRowValues(view2);
  const data2 = view2.getDataSource();

  allValues2.forEach((param) => {
    if ((isEqual(param.cntrNo, cntrDtlNo.cntrNo))
     && (isEqual(param.cntrSn, cntrDtlNo.cntrSn))
     && (isEqual(param.dpDt, dpDt))) {
      data2.removeRow(param.dataRow);
    }
  });
}

/** ****************전금상세 function *********************** */
// 전금상세 - 전금요청금액 변경시 실시간으로 환불상세 데이터의 전금요청금액변동
async function onEditRfnd(cntrNo, rveNo, rveSn) {
  const grdView2 = grdPopRef2.value.getView();
  const grdView3 = grdPopRef3.value.getView();
  const grd2 = gridUtil.getAllRowValues(grdView2);
  const grd3 = gridUtil.getAllRowValues(grdView3);
  let temp = 0;

  for (let i = 0; i < grd3.length; i += 1) {
    if (grd3[i].cntrNo === cntrNo
        && grd3[i].rveNo === rveNo
        && grd3[i].rveSn === rveSn) {
      temp += Number(grd3[i].rfndBltfAkAmt);
    }
  }

  for (let i = 0; i < grd2.length; i += 1) {
    if (grd2[i].cntrNo === cntrNo
        && grd2[i].rveNo === rveNo
        && grd2[i].rveSn === rveSn) {
      grdView2.setValue(i, 'rfndBltfAkAmt', Number(temp));
    }
  }

  // grdPopRef4.value.getView().setValue(0, 'totRfndBltfAkAmt', Number(temp));
  totBltfAkAmt = temp;
}

// 그리드3 - 전금상세 행삭제
// async function onClickRfndDelete() {
//   const view = grdPopRef3.value.getView();
//   await gridUtil.confirmDeleteCheckedRows(view);
//   pageInfo3.value.totalCount = gridUtil.getAllRowValues(view).length;
// }
/** *************************************** */
// 그리드4 (환불접수총액 실시간 계산) - 자동계산 및 기입
async function onCheckTotalData() {
  const view2 = grdPopRef2.value.getView();
  const view4 = grdPopRef4.value.getView();
  const totalView2 = gridUtil.getAllRowValues(view2);

  let temp1 = 0;
  let temp2 = 0;
  let temp3 = 0;
  let temp4 = 0;
  let temp5 = 0;
  for (let i = 0; i < totalView2.length; i += 1) {
    temp1 += Number(totalView2[i].rfndCshAkAmt);
    temp2 += Number(totalView2[i].rfndCardAkAmt);
    temp3 += Number(totalView2[i].rfndBltfAkAmt);
    temp4 += Number(totalView2[i].crdcdFeeAmt);
  }
  temp5 = Number(temp1) + Number(temp2) + Number(temp3) + Number(temp4);
  view4.setValue(0, 'totRfndCshAkAmt', temp1);
  view4.setValue(0, 'totRfndCardAkAmt', temp2);
  view4.setValue(0, 'totRfndBltfAkAmt', temp3);
  view4.setValue(0, 'totCrdcdFeeAmt', temp4);
  view4.setValue(0, 'totRfndEtAmt', Number(temp1) + Number(temp2) + Number(temp3) + Number(temp4));
  totRfndAkAmt = temp5;
}
// eslint-disable-next-line max-len
// async function onClickRfndAddRow(cntrNo, cntrSn, cntrDtlNo, dpDt, dpMesCd, dpAmt, sellTpCd, cstNo, rveNo, rveSn, rfndAkNo) {
//   const view = grdPopRef3.value.getView();
//   gridUtil.insertRowAndFocus(view, 0, {
//     cntrNo,
//     cntrSn,
//     cntrDtlNo,
//     dpDt,
//     dpMesCd,
//     dpAmt,
//     sellTpCd,
//     rfndBltfAkAmt: Number(0),
//     cstNo,
//     rfndEvidMtrFileNm: '파일찾기',
//     rveNo,
//     rveSn,
//     rfndAkNo,
//   });
// }
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

/* 신청정보 */
const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'fnlMdfcUsrNm' },
    { fieldName: 'fnlMdfcUsrId' },
    { fieldName: 'rfndAkDtm', dataType: 'date' },
    { fieldName: 'rfndAkStatCd' },

  ];

  const columns = [
    { fieldName: 'fnlMdfcUsrNm', header: t('MSG_TXT_APPL_USER'), width: 'auto', styleName: 'text-center' }, // 신청자
    { fieldName: 'fnlMdfcUsrId', header: t('MSG_TXT_SEQUENCE_NUMBER'), width: 'auto', styleName: 'text-center' }, // 번호
    { fieldName: 'rfndAkDtm', header: t('MSG_TXT_APPL_DTM'), width: 'auto', styleName: 'text-center', datetimeFormat: 'YYYY-MM-DD' }, // 신청일시
    { fieldName: 'rfndAkStatCd', header: t('MSG_TXT_PROCS_STAT'), width: 'auto', styleName: 'text-center', options: codes.RFND_AK_STAT_CD }, // 처리상태
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

/* TODO: 계약상세 */
/* TODO: 계약상세 */
const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, /* 계약번호 */
    { fieldName: 'cntrSn' }, /* 계약일련번호 */
    { fieldName: 'cntrDtlNo' }, /* 계약상세번호 */
    { fieldName: 'sellTpCd' }, /* 판매유형 */
    { fieldName: 'cstNo' }, /* 고객번호 */
    { fieldName: 'cstKnm' }, /* 계약자명    */
    { fieldName: 'rfndPsbAmt', dataType: 'number' }, /* 환불가능금액 */
    { fieldName: 'dpAmt', dataType: 'number' }, /* 입금액 */
    { fieldName: 'mmIstmAmt', dataType: 'number' }, /* 월납입금 */
    { fieldName: 'dlqAddAmt', dataType: 'number' }, /* 연체가산금 */
    { fieldName: 'borAmt', dataType: 'number' }, /* 위약금액(지불액) */
    { fieldName: 'pdCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'svAmt' }, /* 서비스 금액  */
    { fieldName: 'sellAmt', dataType: 'number' },
  ];
  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // header: '계약상세번호',
      width: '150',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      // header: '판매유형',
      width: '110',
      styleName: 'text-center',
      options: codes.SELL_TP_CD,
    },
    { fieldName: 'cstNo',
      header: t('MSG_TXT_CST_NO'),
      // header: '고객번호',
      width: '110',
      styleName: 'text-center',
    },
    { fieldName: 'cstKnm',
      header: t('MSG_TXT_CNTOR_NM'),
      // header: '계약자명',
      width: '120',
      styleName: 'text-center',
    },
    { fieldName: 'rfndPsbAmt',
      header: t('MSG_TXT_REFUND_AMT'),
      // header: '환불가능금액',
      width: '110',
      styleName: 'text-right',
    },
    { fieldName: 'dpAmt',
      header: t('MSG_TXT_RVE_AMT'),
      // header: '수납금액',
      width: '120',
      styleName: 'text-right',
    },
    { fieldName: 'mmIstmAmt',
      header: t('MSG_TXT_MM_PY_AMT'),
      // 월 납입액 ( 월납입금 )
      width: '120',
      styleName: 'text-right',
    },
    { fieldName: 'dlqAddAmt',
      header: t('MSG_TXT_DLQ_ADAMT'),
      // 연체가산금
      width: '120',
      styleName: 'text-right',
    },
    { fieldName: 'borAmt',
      header: t('MSG_TXT_BOR_AMT_PYMNT_AMT'),
      // 위약금(지불액)
      width: '120',
      styleName: 'text-right',
    },
    { fieldName: 'svAmt',
      header: t('MSG_TXT_SV_AMT'),
      // 서비스금액
      width: '120',
      styleName: 'text-right',
    },
    { fieldName: 'pdNm',
      header: t('MSG_TXT_PRDT_NM'),
      // 상품명
      width: '150',
      styleName: 'text-left',
    },
    { fieldName: 'sellAmt',
      header: t('MSG_TXT_ORDR_AMT'),
      // 주문금액
      width: '120',
      styleName: 'text-right',
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;

  // 단일 선택 , 해제시
  view.onItemChecked = async (grid, itemIndex) => {
    const checkState = grid.isCheckedItem(itemIndex);
    // 체크했을때 - Sub 그리드 데이터 전달
    const cntrNo = grid.getValue(itemIndex, 'cntrNo');
    const cntrSn = grid.getValue(itemIndex, 'cntrSn');

    const cntrDtlNo = {
      cntrNo,
      cntrSn,
    };
    const grdRef2 = grdPopRef2.value.getView();
    const grdRef3 = grdPopRef3.value.getView();
    if (checkState === true) {
      insertMainData(cntrNo, cntrSn);
    } else {
      removeMainData(grdRef2, grdRef3, cntrDtlNo);
    }
    pageInfo2.value.totalCount = gridUtil.getAllRowValues(grdRef2).length;
    await onCheckTotalData();
  };

  // 전체선택시
  view.onItemAllChecked = (grid) => {
    const grdRef2 = grdPopRef2.value.getView();
    const indexLength = gridUtil.getAllRowValues(grdPopRef1.value.getView(), false).length;
    grdRef2.getDataSource().clearRows();

    if (grid.isAllChecked()) {
      for (let i = 0; i < indexLength; i += 1) {
        // insertMainData(grdRef2, grid, i);
        const cntrNo = grid.getValue(i, 'cntrNo');
        const cntrSn = grid.getValue(i, 'cntrSn');
        insertMainData(cntrNo, cntrSn);
      }
    }
    pageInfo2.value.totalCount = gridUtil.getAllRowValues(grdRef2).length;
  };

  // 페이지 스크롤
  view.onScrollToBottom = async (g) => {
    if (pageInfo1.value.pageIndex * pageInfo1.value.pageSize <= g.getItemCount()) {
      pageInfo1.value.pageIndex += 1;
      await fetchData();
    }
  };
});

// TODO: 환불상세 그리드
const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'dpDt', dataType: 'date' },
    { fieldName: 'dpMesCd' }, /* 입금수단 */
    { fieldName: 'rveDvCd' }, /* 입금유형 -> 수납유형(사양서기준) */
    { fieldName: 'dpAmt', dataType: 'number' }, /* 입금액 */
    { fieldName: 'rfndCshAkAmt', dataType: 'number' },
    { fieldName: 'rfndCardAkAmt', dataType: 'number' },
    { fieldName: 'crdcdFeeAmt', dataType: 'number' }, /* 카드수수료 */
    { fieldName: 'crdcdFer', dataType: 'number' }, /* 카드수수료율  */
    { fieldName: 'rfndBltfAkAmt', dataType: 'number' }, /* 전금요청금액(전체)  */
    { fieldName: 'rfndRsonCd' },
    { fieldName: 'rfndRsonCn' },
    { fieldName: 'bltfAdd' }, // 전금추가
    { fieldName: 'rfndAkNo' },
    /* 추가데이터 */
    { fieldName: 'rfndPsbAmt', dataType: 'number' }, /* 환불가능금액 */
    { fieldName: 'rveNo' },
    { fieldName: 'rveSn' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // 계약상세번호
      width: '143',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'dpDt',
      header: t('MSG_TXT_DEP_DT'),
      // 입금일
      width: '110',
      styleName: 'text-center',
      editor: { type: 'date' },
      editable: false },
    { fieldName: 'dpMesCd',
      header: t('MSG_TXT_DP_MES'),
      // 입금수단
      width: '110',
      styleName: 'text-center',
      editable: false,
      options: codes.DP_MES_CD,
    },
    { fieldName: 'rveDvCd',
      header: t('MSG_TXT_DP_TP'),
      // 입금유형
      width: '120',
      styleName: 'text-center',
      editable: false,
      options: codes.RVE_DV_CD,
    },
    { fieldName: 'dpAmt',
      header: t('MSG_TXT_DEPOSIT_AMT'),
      // 입금액
      editor: {
        type: 'number',
      },
      width: '110',
      styleName: 'text-right',
      editable: false,
    },
    { fieldName: 'rfndCshAkAmt',
      header: t('MSG_TXT_CSH_RFND_RQST_AMT'),
      // 현금환불요청금액
      width: '140',
      styleName: 'text-right',
      editable: true,
    },
    { fieldName: 'rfndCardAkAmt',
      header: t('MSG_TXT_CARD_RFND_RQST_AMT'),
      // 카드환불요청금액
      width: '140',
      styleName: 'text-right',
      editable: true },
    { fieldName: 'crdcdFeeAmt',
      header: t('MSG_TXT_CARD_FEE'),
      // 카드수수료
      width: '120',
      styleName: 'text-right',
      editable: false,
      editor: { type: 'number' },
    },
    { fieldName: 'rfndBltfAkAmt',
      header: t('MSG_TXT_BLTF_AK_AMT'),
      // 전금요청금액
      width: '120',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
      editable: false,
    },
    { fieldName: 'bltfAdd',
      header: t('MSG_BTN_BLTF_ADD'),
      // 전금추가
      width: '120',
      styleName: 'text-center',
      editable: false,
      renderer: { type: 'button' },
    },
    { fieldName: 'rfndRsonCd',
      header: t('MSG_TXT_RFND_RSON'),
      // 환불사유
      width: '150',
      styleName: 'text-left',
      editor: { type: 'dropdown' },
      editable: true,
      options: codes.RFND_RSON_CD,
    },
    { fieldName: 'rfndRsonCn',
      header: t('MSG_TXT_RFND_CN'),
      // 환불내용
      width: '120',
      styleName: 'text-left',
      editor: { maxLength: 4000 },
      styleCallback(grid, dataCell) {
        const rfndRsonCd = grid.getValue(dataCell.index.itemIndex, 'rfndRsonCd');
        return rfndRsonCd !== '56' ? { editable: false } : { editable: true };
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  // 그리드의 버튼클릭시 이벤트 발생
  // view.onCellItemClicked = async (g, { column, dataRow }) => {
  // eslint-disable-next-line max-len
  //   const { cntrNo, cntrSn, cntrDtlNo, dpDt, dpMesCd, dpAmt, sellTpCd, cstNo, rveNo, rveSn, rfndAkNo } = gridUtil.getRowValue(g, dataRow);
  //   if (column === 'bltfAdd') {
  //     // eslint-disable-next-line max-len
  //     onClickRfndAddRow(cntrNo, cntrSn, cntrDtlNo, dpDt, dpMesCd, dpAmt, sellTpCd, cstNo, rveNo, rveSn, rfndAkNo);
  //     pageInfo3.value.totalCount = gridUtil.getAllRowValues(grdPopRef3.value.getView()).length;
  //   }
  // };

  // 2번째 GRID 변경(환불상세)에 따라 4번째 GRID(환불접수총액) 상시변경
  // eslint-disable-next-line no-unused-vars
  view.onCellEdited = async (grid, itemIndex) => {
    grid.commit();
    await onCheckTotalData();
  };

  // 입금액보다 환불금액이 큰경우
  // eslint-disable-next-line no-unused-vars
  view.onValidate = (g, index, value) => {
    const { rfndPsbAmt, rfndCshAkAmt, rfndCardAkAmt, rfndBltfAkAmt, crdcdFeeAmt } = g.getValues(index.dataRow);
    if (rfndPsbAmt < (Number(rfndCshAkAmt) + Number(rfndCardAkAmt) + Number(rfndBltfAkAmt) + Number(crdcdFeeAmt))) {
      // 메시지 추가요청
      return notify(t('MSG_ALT_IMP_OVER', [t('MSG_TXT_RFND_AMT'), t('MSG_TXT_REFUND_AMT')]));
      // t('환불금액은 환불가능금액을 초과할수 없습니다.');
    }
  };
});

const initGrid3 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'cntrDtlNo' },
    { fieldName: 'dpDt', dataType: 'date' }, /* 입금일자(수납일자) */
    { fieldName: 'dpMesCd' }, /* 입금수단 */
    { fieldName: 'dpAmt', dataType: 'number' }, /* 입금액 */
    { fieldName: 'rfndBltfAkAmt', dataType: 'number' }, /* 전금요청금액 */
    { fieldName: 'sellTpCd' }, /* 판매유형 */
    { fieldName: 'bltfOjCntrNo' }, /*  전금계약번호  */
    { fieldName: 'bltfOjCntrSn' }, /* 전금계약일련번호 */
    { fieldName: 'bltfOjCntrDtlNo' }, /* 전금계약상세번호 */
    { fieldName: 'bltfRfndMbDvCd' }, /*  전금회원구분코드 */
    { fieldName: 'rfndEvidMtrFileId' }, /* rfndEvidMtrFileId-  전금자료 */
    { fieldName: 'rfndEvidMtrFileNm' }, /* rfndEvidMtrFileNm-  전금자료명(업로드시 버튼형식으로나오면 사용) */
    { fieldName: 'rfndAkNo' },
    /* 환불 - 전금 공통 */
    { fieldName: 'rveNo' },
    { fieldName: 'rveSn' },
  ];

  const columns = [
    { fieldName: 'cntrDtlNo',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      // 계약상세번호
      width: '143',
      styleName: 'text-center',
      editable: false,
      displayCallback(grid, index) {
        const { cntrNo, cntrSn } = grid.getValues(index.itemIndex);
        return `${cntrNo}-${cntrSn}`;
      },
    },
    { fieldName: 'dpDt',
      header: t('MSG_TXT_DP_DT'),
      // 입금일자
      width: '110',
      styleName: 'text-center',
      editor: { type: 'date' },
      editable: false },
    { fieldName: 'dpMesCd',
      header: t('MSG_TXT_DP_MES'),
      // 입금수단
      width: '110',
      styleName: 'text-center',
      editable: false,
      options: codes.DP_MES_CD,
    },
    { fieldName: 'dpAmt',
      header: t('MSG_TXT_DEPOSIT_AMT'),
      // 입금액
      width: '120',
      styleName: 'text-right',
      editable: false },
    { fieldName: 'rfndBltfAkAmt',
      header: t('MSG_TXT_BLTF_AK_AMT'),
      // 전금요청금액
      width: '110',
      styleName: 'text-center',
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'bltfOjCntrDtlNo',
      width: '140',
      header: {
        text: t('MSG_TXT_BLTF_CNTR_DTL_NO'),
        // 전금계약상세번호
        styleName: 'essential',
      },
      styleName: 'text-center',
      editor: {
        type: 'line',
      },

      rules: 'required|min:12|max:17',
      editable: true,
      valueCallback(grid, index) {
        const { bltfOjCntrNo, bltfOjCntrSn } = grid.getValues(index.itemIndex);
        if (bltfOjCntrNo !== '' && bltfOjCntrNo !== undefined) {
          return `${bltfOjCntrNo}-${bltfOjCntrSn}`;
        }
      },
    },
    { fieldName: 'sellTpCd',
      header: t('MSG_TXT_SEL_TYPE'),
      //       header: '판매유형',

      width: '140',
      styleName: 'text-center',
      editable: false,
      options: codes.SELL_TP_CD,
    },
    { fieldName: 'bltfRfndMbDvCd',
      header: t('MSG_TXT_MB_DV'),
      // 회원구분
      width: '280',
      renderer: {
        type: 'radio',
      },
      styleName: 'rg-button-toggle',
      options: codes.BLTF_RFND_MB_DV_CD,
    },
    { fieldName: 'rfndEvidMtrFileId',
    // numberOfFiles : 무조건 fieldName 고정이라하엿지만 그닥큰차이가없어보임
      header: t('MSG_TXT_MTR'),
      // TODO: 자료: 그리드 업로드 문의
      width: '120',
      editor: {
        type: 'file',
        attachDocumentId: 'rfndEvidMtrFileId',
        attachGroupId: 'ATG_WDA_ENTRP_FILE',
        downloadable: true,
        editable: false,
      },
      styleName: 'rg-button-excelup',
      renderer: { type: 'button' },
      // styleCallback(grid, dataCell) {
      //   const bltfRfndMbDvCd = grid.getValue(dataCell.index.itemIndex, 'bltfRfndMbDvCd');
      //   return bltfRfndMbDvCd === '02' ? { editor: { editable: true } } : { editor: { editable: false } };
      //   {
      //     editor: {
      //       type: 'file',
      //       attachDocumentId: 'rfndEvidMtrFileId',
      //       attachGroupId: 'ATG_WDA_ENTRP_FILE',
      //       downloadable: true,
      //       editable: true,
      //     } } : { editor: {
      //     type: 'file',
      //     attachDocumentId: 'rfndEvidMtrFileId',
      //     attachGroupId: 'ATG_WDA_ENTRP_FILE',
      //     downloadable: true,
      //     editable: false,
      //   } };
      // },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.editOptions.editable = false;

  // 전금요청상세데이터가 변경될때마다, 환불상세 데이터를 변경.
  view.onCellEdited = async (grid, itemIndex) => {
    // const { sellAmt, cntrAmt, afctIstmMcn } = grid.getValues(itemIndex);
    const { cntrNo, rveNo, rveSn, dpAmt, rfndBltfAkAmt } = grid.getValues(itemIndex);
    if (dpAmt < rfndBltfAkAmt) {
      grid.setValue(itemIndex, 'rfndBltfAkAmt', Number(0));
    } else {
      grid.setValue(itemIndex, 'rfndBltfAkAmt', Number(rfndBltfAkAmt));
    }
    grid.commit();
    await onEditRfnd(cntrNo, rveNo, rveSn);
    await onCheckTotalData();
  };

  // 전금계약상세번호 검색
  view.onCellButtonClicked = async (grid, { column }) => {
    // if (column === 'bltfOjCntrDtlNo') {
    //   const { result, payload } = await modal({
    //     component: 'WwctaContractNumberListP',
    //   });
    //   if (result) {
    //     // eslint-disable-next-line no-unused-vars
    //     const { cntrNo, cntrSn, sellTpCd, cntrCstKnm, pdNm, pdCd } = payload;
    //     view.setValue(itemIndex, 'bltfOjCntrNo', cntrNo);
    //     view.setValue(itemIndex, 'bltfOjCntrSn', cntrSn);
    //     view.setValue(itemIndex, 'bltfOjCntrDtlNo', cntrNo + cntrSn);
    //     view.setValue(itemIndex, 'sellTpCd', sellTpCd);
    //   }
    // }
    // 첨부파일 팝업
    // TODO: 그리드 엑셀업로드 확인필요
    if (column === 'rfndEvidMtrFileId') {
      await modal({
        component: 'ZwcmFileAttacher',
        // componentProps: { cntrNo, sellTpCd},
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  view.onValidate = (g, index, value) => {
    const { cntrDtlNo, bltfOjCntrDtlNo } = g.getValues(index.dataRow);
    if (cntrDtlNo === bltfOjCntrDtlNo) {
      // g.setValue(index.dataRow, 'bltfRfndMbDvCd', '01');
      return t('계약번호와 전금계약번호가 동일합니다.');
    }
    // g.setValue(index.dataRow, 'bltfRfndMbDvCd', '02');
  };
});

const initGrid4 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'totRfndCshAkAmt', dataType: 'number' },
    { fieldName: 'totRfndCardAkAmt', dataType: 'number' },
    { fieldName: 'totRfndBltfAkAmt', dataType: 'number' },
    { fieldName: 'totCrdcdFeeAmt', dataType: 'number' },
    { fieldName: 'totRfndEtAmt', dataType: 'number' },
  ];

  const columns = [
    { fieldName: 'totRfndCshAkAmt',
      header: t('MSG_TXT_CSH_RFND_AMT'),
      // 현금환불금액
      width: 'auto',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'totRfndCardAkAmt',
      header: t('MSG_TXT_CARD_RFND_AMT'),
      // 카드 환불금액
      width: 'auto',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'totRfndBltfAkAmt',
      header: t('MSG_TXT_BLTF_AMT'),
      // 전금금액
      width: 'auto',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'totCrdcdFeeAmt',
      header: t('MSG_TXT_CARD_FEE'),
      // 카드수수료
      width: 'auto',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
    },
    { fieldName: 'totRfndEtAmt',
      header: t('MSG_TXT_TOT_RFND_ET_AMT'),
      //  '총 환불 예상금액'
      width: 'auto',
      styleName: 'text-right',
      editor: {
        type: 'number',
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;

  // eslint-disable-next-line no-unused-vars
  // view.onValidate = (g, index, value) => {
  //   const { totRfndEtAmt } = g.getValues(index.dataRow);
  //   if (Number(totRfndEtAmt) === 0) {
  //     return t('변경된 사항이 없습니다.');
  //   }
  // };
});
</script>
