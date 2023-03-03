<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : WwsnbIndividualVisitPeriodMgtP - 개인별 방문주기 생성
3. 작성자 : juno.cha
4. 작성일 : 2023.02.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 개인별 방문주기 생성 팝업
****************************************************************************************************
--->
<template>
  <kw-popup
    size="3xl"
    no-action
  >
    <kw-action-top>
      <template #left>
        <h3>{{ $t('고객정보') }}</h3>
      </template>

      <kw-btn
        icon="print"
        dense
        secondary
        :label="$t('인쇄')"
      />
    </kw-action-top>

    <kw-form>
      <kw-form-row>
        <kw-form-item :label="$t('계약번호')">
          <kw-input
            v-model="customerInfo.cntrNo"
            readonly
            placeholder=""
          />
        </kw-form-item>
        <kw-form-item :label="$t('고객명')">
          <kw-input
            v-model="customerInfo.rcgvpKnm"
            readonly
            placeholder=""
          />
        </kw-form-item>
        <kw-form-item :label="$t('계약상품')">
          <kw-input
            v-model="customerInfo.pdNm"
            readonly
            placeholder=""
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('설치일자')">
          <kw-date-picker
            v-model="customerInfo.istDt"
            readonly
            placeholder=""
          />
        </kw-form-item>
        <kw-form-item :label="$t('멤버십시작일')">
          <kw-date-picker
            v-model="customerInfo.memberStartDt"
            readonly
            placeholder=""
          />
        </kw-form-item>
        <kw-form-item :label="$t('멤버십종료일')">
          <kw-date-picker
            v-model="customerInfo.memberEndDt"
            readonly
            placeholder=""
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('판매유형')">
          <kw-select
            v-model="customerInfo.sellTpCd"
            readonly
            placeholder=""
            :model-value="[]"
            :options="codes.SELL_TP_CD"
          />
        </kw-form-item>
        <kw-form-item :label="$t('방문주기')">
          <kw-select
            v-model="customerInfo.chkPrdCd"
            readonly
            placeholder=""
            :model-value="[]"
            :options="['A', 'B', 'C', 'D']"
          />
        </kw-form-item>
        <kw-form-item :label="$t('용도구분')">
          <kw-select
            v-model="customerInfo.pdGdCd"
            readonly
            placeholder=""
            :model-value="[]"
            :options="codes.PD_GD_CD"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('무상기간(개월)')">
          <kw-input
            v-model="customerInfo.frisuBfsvcPtrmN"
            readonly
            placeholder=""
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <kw-action-top>
      <template #left>
        <h3>{{ $t('배정변경') }}</h3>
      </template>

      <kw-btn
        dense
        secondary
        :label="$t('B/S 배정')"
        @click="onClickBSAssign"
      />
      <kw-btn
        dense
        secondary
        :label="$t('B/S 배정 이월')"
        @click="onClickBSCarriedForward"
      />
      <kw-btn
        dense
        secondary
        :label="$t('B/S 배정 삭제')"
        @click="onClickBSDelete"
      />
      <kw-btn
        dense
        secondary
        :label="$t('B/S 강제배정')"
        @click="onClickBSForceAssign"
      />
      <kw-btn
        dense
        secondary
        :label="$t('방문주기 삭제')"
        @click="onClickVisitPeriodDelete"
      />
      <kw-btn
        dense
        secondary
        :label="$t('방문주기 재생성')"
        @click="onClickVisitPeriodRegen"
      />
    </kw-action-top>

    <kw-form>
      <kw-form-row>
        <kw-form-item :label="$t('기준일자')">
          <kw-date-picker
            v-model="processParam.baseYmd"
          />
        </kw-form-item>
        <kw-form-item :label="$t('방문차월')">
          <kw-input
            v-model="processParam.vstNmnN"
          />
        </kw-form-item>
        <kw-form-item :label="$t('주기삭제')">
          <kw-date-picker
            v-model="processParam.periodDeleteYmd"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('배정일자')">
          <kw-date-picker
            v-model="processParam.asnOjYmd"
            @change="onChangeAsnOjYmd"
          />
        </kw-form-item>
        <kw-form-item :label="$t('이월대상')">
          <kw-date-picker
            v-model="processParam.carriedForwardYmd"
          />
        </kw-form-item>
        <kw-form-item :label="$t('요청사유')">
          <kw-input
            v-model="processParam.rqstRsn"
          />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <kw-separator />
    <h3>{{ $t('고객방문 현황 / 주기표') }}</h3>
    <div class="grid-horizontal-wrap pb0">
      <div class="grid-horizontal-wrap__section">
        <kw-action-top>
          <template #left>
            <kw-paging-info
              :total-count="totalCountForLeft.totalCount"
            />
          </template>
        </kw-action-top>
        <kw-grid
          ref="gridMainRef1"
          :visible-rows="10"
          @init="initGrid1"
        />
      </div>
      <div class="grid-horizontal-wrap__section">
        <kw-action-top>
          <template #left>
            <kw-paging-info
              :total-count="totalCountForRight.totalCount"
            />
          </template>
        </kw-action-top>
        <kw-grid
          ref="gridMainRef2"
          :visible-rows="10"
          @init="initGrid2"
        />
      </div>
    </div>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, defineGrid, getComponentType, useGlobal, codeUtil } from 'kw-lib';
import { isEmpty } from 'lodash-es';

const { alert, notify } = useGlobal();

const { t } = useI18n();
const dataService = useDataService();
const gridMainRef1 = ref(getComponentType('KwGrid'));
const gridMainRef2 = ref(getComponentType('KwGrid'));

/*
 *  Parent Parameter를 가져오기 위한 변수 선언.
 */
const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: String,
    required: true,
  },
});

const customerParam = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
});

const periodParam = ref({
  svPdCd: '',
  pdctPdCd: '',
});

const processParam = ref({
  cntrNo: props.cntrNo,
  cntrSn: props.cntrSn,
  baseYmd: '',
  vstNmnN: '',
  periodDeleteYmd: '',
  asnOjYmd: '',
  carriedForwardYmd: '',
  rqstRsn: '',
});

const totalCountForLeft = ref({
  totalCount: 0,
});
const totalCountForRight = ref({
  totalCount: 0,
});

const customerInfo = ref({
  cntrNo: '',
  rcgvpKnm: '',
  basePdCd: '',
  pdNm: '',
  istDt: '',
  memberStartDt: '',
  memberEndDt: '',
  sellTpCd: '',
  chkPrdCd: '',
  pdGdCd: '',
  frisuBfsvcPtrmN: '',
  svPdCd: '',
  pdctPdCd: '',
});

// const visitList = ref({
//   cntrNo: '',
//   rcgvpKnm: '',
//   basePdCd: '',
//   pdNm: '',
//   istDt: '',
//   memberStartDt: '',
//   memberEndDt: '',
//   sellTpCd: '',
//   chkPrdCd: '',
//   pdGdCd: '',
//   frisuBfsvcPtrmN: '',
// });

// const periodList = ref({
//   cntrNo: '',
//   rcgvpKnm: '',
//   basePdCd: '',
//   pdNm: '',
//   istDt: '',
//   memberStartDt: '',
//   memberEndDt: '',
//   sellTpCd: '',
//   chkPrdCd: '',
//   pdGdCd: '',
//   frisuBfsvcPtrmN: '',
// });

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형
  'PD_GD_CD', // 용도구분
  'VST_DV_CD', // 방문구분
);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
/*
 *  조회(고객정보, 방문현황, 주기표)
 */
async function getCustomerVisitPeriod() {
  const res = await dataService.get('/sms/wells/service/individual-visit-prds/getCustomerInfo', { params: { ...customerParam.value } });
  customerInfo.value = res.data;

  // 방문현황 조회
  const visitRes = await dataService.get('/sms/wells/service/individual-visit-prds/getVisits', { params: { ...customerParam.value } });
  // visitList.value = visitRes.data;
  const view1 = gridMainRef1.value.getView();
  totalCountForLeft.value.totalCount = visitRes.data.length;
  view1.getDataSource().setRows(visitRes.data);
  view1.resetCurrent();

  // 주기표 조회
  periodParam.value.svPdCd = customerInfo.value.svPdCd;
  periodParam.value.pdctPdCd = customerInfo.value.pdctPdCd;
  const periodRes = await dataService.get('/sms/wells/service/individual-visit-prds/getPeriods', { params: { ...periodParam.value } });
  // periodList.value = periodRes.data;
  const view2 = gridMainRef2.value.getView();
  totalCountForRight.value.totalCount = periodRes.data.length;
  view2.getDataSource().setRows(periodRes.data);
  view2.resetCurrent();
}
getCustomerVisitPeriod();

/*
 *  Event - B/S 배정 버튼 클릭
 */
async function onClickBSAssign() {
  // 배정일자
  if (processParam.value.asnOjYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('배정일자')]));
    return;
  }

  // 요청사유
  if (processParam.value.rqstRsn === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('요청사유')]));
    return;
  }

  const res = await dataService.post('/sms/wells/service/individual-visit-prds/bs-assigns', processParam.value);

  if (res.status === 200) {
    await notify(t('MSG_ALT_SAVE_DATA'));
  }
}

/*
 *  Event - B/S 배정 이월 버튼 클릭
 */
async function onClickBSCarriedForward() {
  // 배정일자
  if (processParam.value.asnOjYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('배정일자')]));
    return;
  }

  // 이월대상
  if (processParam.value.carriedForwardYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('이월대상')]));
    return;
  }

  // 요청사유
  if (processParam.value.rqstRsn === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('요청사유')]));
    return;
  }

  const res = await dataService.post('/sms/wells/service/individual-visit-prds/carried-forwards', processParam.value);

  if (res.status === 200) {
    await notify(t('MSG_ALT_SAVE_DATA'));
  }
}

/*
 *  Event - B/S 배정 삭제 버튼 클릭
 */
async function onClickBSDelete() {
  // 배정일자
  if (processParam.value.asnOjYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('배정일자')]));
    return;
  }

  // 이월대상
  if (processParam.value.carriedForwardYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('이월대상')]));
    return;
  }

  // 요청사유
  if (processParam.value.rqstRsn === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('요청사유')]));
    return;
  }

  const res = await dataService.delete('/sms/wells/service/individual-visit-prds/bs-deletes', { params: { ...processParam.value } });

  if (res.status === 200) {
    await notify(t('MSG_ALT_DELETED'));
  }
}

/*
 *  Event - B/S 강제배정 버튼 클릭
 */
async function onClickBSForceAssign() {
  // 기준일자
  if (processParam.value.baseYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('기준일자')]));
    return;
  }

  // 배정일자
  if (processParam.value.asnOjYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('배정일자')]));
    return;
  }

  // 요청사유
  if (processParam.value.rqstRsn === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('요청사유')]));
    return;
  }

  const res = await dataService.post('/sms/wells/service/individual-visit-prds/bs-force-assigns', processParam.value);

  if (res.status === 200) {
    await notify(t('MSG_ALT_SAVE_DATA'));
  }
}

/*
 *  Event - 방문주기 삭제 버튼 클릭
 */
async function onClickVisitPeriodDelete() {
  // 주기삭제
  if (processParam.value.periodDeleteYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('주기삭제')]));
    return;
  }

  // 요청사유
  if (processParam.value.rqstRsn === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('요청사유')]));
    return;
  }

  const res = await dataService.delete('/sms/wells/service/individual-visit-prds/visit-period-deletes', { params: { ...processParam.value } });

  if (res.status === 200) {
    await notify(t('MSG_ALT_DELETED'));
  }
}

/*
 *  Event - 방문주기 재생성 버튼 클릭
 */
async function onClickVisitPeriodRegen() {
  // 기준일자
  if (processParam.value.baseYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('기준일자')]));
    return;
  }

  // 주기삭제
  if (processParam.value.periodDeleteYmd === '') {
    await alert(t('MSG_ALT_NCELL_REQUIRED_ITEM', [t('주기삭제')]));
    return;
  }

  const res = await dataService.post('/sms/wells/service/individual-visit-prds/visit-period-regens', processParam.value);

  if (res.status === 200) {
    await notify(t('MSG_ALT_SAVE_DATA'));
  }
}

/*
 * Event - 배정일자 변경
 */
async function onChangeAsnOjYmd() {
  // 배정일자 변경 시 이월대상에 자동 세팅
  processParam.value.carriedForwardYmd = processParam.value.asnOjYmd;
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid1 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'vstNmnN' },
    { fieldName: 'istNmnN' },
    { fieldName: 'vstDuedt' },
    { fieldName: 'svBizDclsfCd' },
    { fieldName: 'filtChngLvCd' },
    { fieldName: 'pdNm' },
    { fieldName: 'wkDt' },
    { fieldName: 'mtrCanDt' },
  ];

  const columns = [
    { fieldName: 'vstNmnN', header: '방문', width: '100', styleName: 'text-center' },
    { fieldName: 'istNmnN', header: '설치', width: '100', styleName: 'text-center' },
    { fieldName: 'vstDuedt', header: '예정일자', datetimeFormat: 'yyyy-MM-dd', width: '100', styleName: 'text-center' },
    { fieldName: 'svBizDclsfCd', header: '작업구분', width: '100', styleName: 'text-left' },
    {
      fieldName: 'filtChngLvCd',
      header: '단계',
      width: '100',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        if (isEmpty(value) || value === '0' || value === '00') {
          return '';
        }
        return value;
      },
    },
    { fieldName: 'pdNm', header: '필터명', width: '167', styleName: 'text-left' },

  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.checkBar.visible = false;
  view.rowIndicator.visible = true;
  data.setRows([
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '', vstDuedt: '', svBizDclsfCd: '정기점검', filtChngLvCd: '00', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '0', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },
    { vstNmnN: '3', istNmnN: '3', vstDuedt: '20140703', svBizDclsfCd: '정기점검', filtChngLvCd: '01', pdNm: '복합프리 <PK2 42000-1' },

  ]);
});

const initGrid2 = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'vstNmnN' },
    { fieldName: 'bfsvcWkDvCd' },
    { fieldName: 'col3' },
    { fieldName: 'pdNm' },
    { fieldName: 'partUseQty' },
    { fieldName: 'vstDvCd' },
  ];

  const columns = [
    { fieldName: 'vstNmnN', header: '방문차월', width: '100', styleName: 'text-center' },
    { fieldName: 'bfsvcWkDvCd', header: '작업구분', width: '100', styleName: 'text-left' },
    { fieldName: 'col3', header: '단계', width: '100', styleName: 'text-center' },
    { fieldName: 'pdNm', header: '필터명', width: '250', styleName: 'text-left' },
    { fieldName: 'partUseQty', header: '수량', width: '116', styleName: 'text-right' },
    { fieldName: 'vstDvCd', header: '방문구분', width: '116', options: codes.VST_DV_CD, styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.checkBar.visible = false;
  view.rowIndicator.visible = true;

  data.setRows([
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '0', vstDvCd: '10' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: '11' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: '20' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: 'A' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: 'A' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: 'A' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: 'A' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: 'A' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: 'A' },
    { vstNmnN: '3차월', bfsvcWkDvCd: '정기점검', col3: '1단계', pdNm: '복합프리 <PK2 42000-1', partUseQty: '1', vstDvCd: 'A' },
  ]);
});

</script>
