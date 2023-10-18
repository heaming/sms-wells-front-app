<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : WwsnaReturningGoodsStoreMgtM - 반품입고 관리(W-SV-U-0108M01)
 3. 작성자 : SongTaeSung
 4. 작성일 : 2023.05.04
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 반품입고 관리 (http://localhost:3000/#/service/wwsna-returning-goods-store-mgt)
 ****************************************************************************************************
--->

<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
    >
      <kw-search-row>
        <!-- 상품등급 -->
        <kw-search-item
          :label="$t('MSG_TXT_PD_GRD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.fnlItmGdCd"
            dense
            first-option="all"
            :options="filterCodes.filterPdGdCd"
          />
          <kw-field :model-value="[]">
            <template #default="{ field }">
              <!-- 등급오류 -->
              <kw-checkbox
                v-bind="field"
                v-model="searchParams.chkErrorCheck"
                :label="$t('MSG_TXT_GD_ERR')"
              />
            </template>
          </kw-field>
        </kw-search-item>

        <!-- 품목코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_ITM_CD')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.itmKndCd"
            :options="codes.ITM_KND_CD"
            first-option="all"
            class="w120"
          />
          <kw-select
            v-model="searchParams.itmPdCd"
            :options="itemKndCdD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 바코드필터링 -->
        <kw-search-item :label="$t('MSG_TXT_BC_FLTR')">
          <kw-input
            v-model="searchParams.barCode"
          />
        </kw-search-item>
        <!-- 업무유형 -->
        <kw-search-item :label="$t('MSG_TXT_TASK_TYPE')">
          <kw-select
            v-model="searchParams.svBizDclsfCd"
            :options="filterCodes.filterSvBizDclsfCd"
            first-option="all"
          />
        </kw-search-item>
        <!-- 입고확인 -->
        <kw-search-item
          :label="$t('MSG_TXT_STR_CONF')"
          :colspan="2"
        >
          <kw-select
            v-model="searchParams.strConfYnCd"
            :options="codes.STR_CONF_YN_CD"
            first-option="all"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 처리일자 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRCSDT')"
          :colspan="2"
          required
        >
          <kw-date-range-picker
            v-model:from="searchParams.stFnlVstFshDtFrom"
            v-model:to="searchParams.edFnlVstFshDtTo"
            rules="date_range_months:1|required"
            :label="$t('MSG_TXT_PRCSDT')"
          />
        </kw-search-item>
        <!-- 확인일자 -->
        <kw-search-item :label="$t('MSG_TXT_CONF_DT')">
          <kw-date-picker
            v-model="searchParams.stOstrConfDt"
          />
          <!-- 반품처리유형 -->
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_RTNGD_PROCS_TP')">
          <kw-select
            v-model="searchParams.stRtngdProcsTpCd"
            :options="codes.RTNGD_PROCS_TP_CD"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 서비스센터 -->
        <!-- 입고창고 -->
        <ZwcmWareHouseSearch
          v-model:start-ym="searchParams.stFnlVstFshDtFrom"
          v-model:end-ym="searchParams.edFnlVstFshDtTo"
          v-model:options-ware-dv-cd="strWareDvCd"
          v-model:ware-dv-cd="searchParams.strWareDvCd"
          v-model:ware-no-m="searchParams.strWareNoM"
          v-model:ware-no-d="searchParams.strWareNoD"
          sub-first-option="all"
          :colspan="2"
          :label1="$t('MSG_TXT_OSTR_PTRM')"
          :label2="$t('MSG_TXT_STR_WARE')"
          :label3="$t('MSG_TXT_WARE')"
          :label4="$t('MSG_TXT_WARE')"
          @update:ware-no-m="onChagneHgrWareNo"
        />
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="totalCount"
          />
        </template>
        <!-- 저장 -->
        <kw-btn
          v-permission:update
          grid-action
          :label="$t('MSG_BTN_SAVE')"
          @click="onClickRtnGd"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 엑셀다운로드 -->
        <kw-btn
          v-permission:download
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
          :disable="totalCount === 0"
          @click="onClickExcelDownload"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-date-picker
          v-model="baseInfo.ostrConfDt"
          dense
          class="w130"
        />
        <!-- 확인일자 일괄변경 -->
        <kw-btn
          v-permission:read
          dense
          secondary
          :label="$t('MSG_BTN_CONF_DT_BLK_CH')"
          @click="onClickGridBulkChange(baseInfo.ostrConfDt, 'ostrConfDt')"
        />
        <kw-select
          v-model="baseInfo.rtngdProcsTpCd"
          :options="codes.RTNGD_PROCS_TP_CD"
          dense
          class="w130"
        />
        <!-- 반품처리유형 일괄변경 -->
        <kw-btn
          v-permission:read
          dense
          secondary
          :label="$t('MSG_BTN_RTNGD_PROCS_TP_BLK_CH')"
          @click="onClickGridBulkChange(baseInfo.rtngdProcsTpCd, 'rtngdProcsTpCd')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <!-- 반품확인저장 -->
        <kw-btn
          v-permission:update
          :label="$t('MSG_BTN_RTNGD_CONF_SAVE')"
          primary
          dense
          @click="onClickSave"
        >
          <kw-tooltip>
            <!-- 저장시 수불이 발생합니다. -->
            {{ $t('MSG_TXT_SAVE_RVPY_OC') }}
          </kw-tooltip>
        </kw-btn>
      </kw-action-top>

      <ul class="filter-box mb12  ">
        <li class="filter-box__item">
          <!-- 상품군셀렉트박스 -->
          <p class="filter-box__item-label">
            {{ $t('MSG_TXT_PDGRP') }}
          </p>
          <kw-select
            v-model="searchParams.pdGrpCd"
            dense
            first-option="all"
            :options="codes.PD_GRP_CD"
            @update:model-value="onUpdateProductGroupCode"
          />
        </li>
      </ul>
      <kw-grid
        ref="grdMainRef"
        :total-count="totalCount"
        @init="initGrdMain"
      />
    </div>
  </kw-page>
</template>
<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, getComponentType, defineGrid, useGlobal, gridUtil, popupUtil } from 'kw-lib';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash-es';
import ZwcmWareHouseSearch from '~sms-common/service/components/ZwsnzWareHouseSearch.vue';

const { t } = useI18n();
const { notify, alert } = useGlobal();
const { currentRoute } = useRouter();
const store = useStore();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'PD_GD_CD', // 상품등급
  'PD_GRP_CD', // 상품그룹코드
  'ITM_KND_CD', // 품목종류코드
  'SV_BIZ_DCLSF_CD', // 서비스업무세분류코드
  'STR_CONF_YN_CD', // 입고확인여부코드
  'RTNGD_PROCS_TP_CD', // 반품처리유형
  'WARE_DV_CD', // 창고구분코드
);

// 창고구분코드 필터링
const strWareDvCd = { WARE_DV_CD: [
  { codeId: '2', codeName: t('MSG_TXT_SV_CNR') },
] };

const totalCount = ref(0);
const loginWare = ref();

const filterCodes = ref({
  filterPdGdCd: [],
  filterSvBizDclsfCd: [],

});

// 코드값 필터링
filterCodes.value.filterPdGdCd = codes.PD_GD_CD.filter((v) => ['A', 'B', 'E', 'R', 'X'].includes(v.codeId));
filterCodes.value.filterSvBizDclsfCd = codes.SV_BIZ_DCLSF_CD.filter((v) => ['3420', '3410', '3488', '3210', '3230', '3112'].includes(v.codeId));

// 반품처리유형 코드값 첫번째 자리에 빈값추가
codes.RTNGD_PROCS_TP_CD.unshift({ codeId: '', codeName: '' });

// 조회용 파라미터
const searchParams = ref({
  pdGrpCd: '',
  fnlItmGdCd: '',
  itmPdCd: '',
  itmKndCd: '4',
  stFnlVstFshDtFrom: dayjs().set('date', 1).format('YYYYMMDD'),
  edFnlVstFshDtTo: dayjs().format('YYYYMMDD'),
  stRtngdProcsTpCd: '',
  svBizDclsfCd: '', // 서비스업무세분류코드
  strConfYnCd: '', // 입고확인여부코드
  stOstrConfDt: '', // 확인일자
  strWareDvCd: '2',
  strWareNoM: '',
  strWareNoD: '',
  barCode: '',
  chkErrorCheck: 'N',
  prtnrNo: store.getters['meta/getUserInfo'].employeeIDNumber,

});

const baseInfo = ref({
  ostrConfDt: '',
  rtngdProcsTpCd: '',
});

// 상위창고변경 이벤트
function onChagneHgrWareNo() {
  searchParams.value.strWareNoD = '';
}

// null체크
function isNotEmpty(obj) {
  return (obj !== undefined && obj !== null && obj !== '');
}

// input에 값이 정상적으로 들어갔는지 체크
function validateInputValueExists(input, inputType) {
  if (input === '' && inputType === '확인일자') {
    notify(t('MSG_ALT_SELECT_VAL', [inputType]));
    return false;
  }
  return true;
}

// 체크박스 선택시 체크로직
function validateIsApplyRowExists() {
  const view = grdMainRef.value.getView();
  if (view.getItemCount() === 0) {
    // 적용 대상 데이터가 없습니다.
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return false;
  }
  return true;
}

// 확인일자 및 반품처리유형 일괄변경 버튼 클릭 이벤트
function onClickGridBulkChange(val, type) {
  const inputType = type === 'rtngdProcsTpCd' ? '반품처리유형' : '확인일자';

  if (!validateInputValueExists(val, inputType)) return;
  if (!validateIsApplyRowExists()) return;

  const view = grdMainRef.value.getView();
  const rowCount = view.getItemCount();

  for (let dataRow = 0; dataRow < rowCount; dataRow += 1) {
    const chkValue = gridUtil.getRowValue(view, dataRow);
    console.log(chkValue);
    if (isEmpty(chkValue.ostrConfDt) || isEmpty(chkValue.rtngdProcsTpCd)) {
      view.setValue(dataRow, type, val);
      view.checkRow(dataRow, true);
    }
  }

  notify(t('MSG_ALT_BULK_APPLY_SUCCESS', [inputType]));
}

// 로그인한 사용자의 상위창고 조회
const getWareHouses = async () => {
  const res = await dataService.get('/sms/wells/service/returning-goods-store/login-warehouse', { params: { prtnrNo: searchParams.value.prtnrNo } });
  loginWare.value = res.data;

  searchParams.value.strWareNoM = loginWare.value[0].hgrWareNo;
};

const itemKndCdD = ref();

// 품목코드 변경이벤트
const onChangeItmKndCd = async () => {
  const res = await dataService.get('/sms/wells/service/as-consumables-stores/filter-items', { params: searchParams.value });
  itemKndCdD.value = res.data;
};

watch(() => searchParams.value.itmKndCd, (val) => {
  if (searchParams.value.itmKndCd !== val) {
    searchParams.value.itmKndCd = val;
  }
  onChangeItmKndCd();
});

let cachedParams;

// 상품그룹코드 필터링
const filters = codes.PD_GRP_CD.map((v) => ({ name: v.codeId, criteria: `value = '${v.codeId}'` }));
function onUpdateProductGroupCode(val) {
  const view = grdMainRef.value.getView();
  view.activateAllColumnFilters('itemGr', false);
  view.activateColumnFilters('itemGr', [val], true);
}

await Promise.all([
  onChangeItmKndCd(),
  // 창고조회
  getWareHouses(),
]);

// 조회 이벤트
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/returning-goods-store', { params: { ...cachedParams } });
  const goods = res.data;

  totalCount.value = goods.length;
  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(goods);

  searchParams.value.pdGrpCd = '';

  view.autoFiltersRefresh('itemGr', false);
  view.setColumnFilters('itemGr', filters, true);

  let count = 0;
  if (searchParams.value.chkErrorCheck === 'N') {
    for (let i = 0; i < goods.length; i += 1) {
      const rowErrorCheck = goods[i].errorCheck;
      if (rowErrorCheck > 0) {
        count += 1;
      }
    }
    if (count > 0) {
      // 등급오류건이 {0}건 존재합니다.
      await alert(t('MSG_ALT_GD_ERR_CT_EXST', [count]));
    }
  }
}

// 엑셀다운로드 버튼 클릭 이벤트
async function onClickExcelDownload() {
  const view = grdMainRef.value.getView();
  const res = await dataService.get('/sms/wells/service/returning-goods-store/excel-download', { params: cachedParams });
  await gridUtil.exportView(view, {
    fileName: currentRoute.value.meta.menuName,
    timePostfix: true,
    checkBar: 'hidden',
    exportData: res.data,
  });
}

// 조회버튼 클릭 이벤트
async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

// 반품 확인 저장
async function onClickSave() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (gridUtil.getCheckedRowValues(view).length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }

  // 저장시 체크로직
  for (let i = 0; i < checkedRows.length; i += 1) {
    const checkedOstrConfDt = checkedRows[i].ostrConfDt;
    const checkedRtngdProcsTpCd = checkedRows[i].rtngdProcsTpCd;
    const checkedErrorChecked = checkedRows[i].errorCheck;

    if (isNotEmpty(checkedOstrConfDt) && isEmpty(checkedRtngdProcsTpCd)) {
      // 반품처리유형 항목에 값이 누락되었습니다.
      notify(t('MSG_ALT_RTNGD_PROCS_TP_ATC'));
      return;
    }
    if (isEmpty(checkedOstrConfDt) && isNotEmpty(checkedRtngdProcsTpCd)) {
      // 확인일자 항목에 값이 누락되었습니다.
      notify(t('MSG_ALT_CONF_DT_ATC_IS_NULL'));
      return;
    }

    if (isEmpty(checkedOstrConfDt) && isEmpty(checkedRtngdProcsTpCd)) {
      // 확인일자 및 반품처리유형 항목에 값이 없습니다.
      notify(t('MSG_ALT_CONF_DT_RTNGD_PROCS_TP_ZR'));
      return;
    }

    // 등급오류건 항목이 있는지 체크로직
    if (checkedErrorChecked > 0) {
      // 10 : 물류폐기, 11 : 리퍼-E급 tt물류폐기 , 20 : 리퍼용, 21 : 품질팀 , 22 리퍼-tt특별자재 일경우
      if (['10', '11', '20', '21', '22'].includes(checkedRtngdProcsTpCd)) {
        // 등급 오류 건이 포함되어있습니다. 확인 후 처리해주십시오
        notify(t('MSG_ALT_GD_ERR_CT_EXST_CONF'));
        return;
      }
    }
  }
  await dataService.post('/sms/wells/service/returning-goods-store', checkedRows);

  notify(t('MSG_ALT_SAVE_DATA'));

  await fetchData();
}

// 저장버튼 클릭이벤트
async function onClickRtnGd() {
  const view = grdMainRef.value.getView();
  const checkedRows = gridUtil.getCheckedRowValues(view);

  if (gridUtil.getCheckedRowValues(view).length === 0) {
    notify(t('MSG_ALT_NO_APPY_OBJ_DT'));
    return;
  }

  // if (!(await gridUtil.validate(view, { isCheckedOnly: true }))) { return; }
  if (await gridUtil.alertIfIsNotModified(view)) { return; }

  // 10 : 물류폐기, 11 : 리퍼-E급 tt물류폐기 , 20 : 리퍼용,
  // 21 : 품질팀 , 22 : 리퍼-tt특별자재
  // 80 : 리퍼작업완료-A급, 81 : 리퍼작업완료-B-1급, 82 : 리퍼작업완료-B-2급
  const strRtngdProcsTpCd = ['10', '11', '20', '21', '22', '80', '81', '82'];

  for (let i = 0; i < checkedRows.length; i += 1) {
    const { rtngdRvpyProcsYn, rtngdProcsTpCd } = checkedRows[i];

    const checkedRtngdProcsTpCd = checkedRows[i].rtngdProcsTpCd;

    if (isEmpty(checkedRtngdProcsTpCd)) {
      // 반품처리유형 항목에 값이 누락되었습니다.
      notify(t('MSG_ALT_RTNGD_PROCS_TP_ATC'));
      return;
    }
    if (rtngdRvpyProcsYn === 'Y') {
      // 이미 반품 완료된 건이 포함되었습니다. \n확인해주십시오.
      notify(t('MSG_ALT_RTNGD_FSH_INC_CONF'));
      return;
    }

    if (strRtngdProcsTpCd.includes(rtngdProcsTpCd)) {
      // 처리할 수 없는 유형이 포함되었습니다.
      // 확인해주십시오.
      notify(t('MSG_ALT_PROCS_IMP_TP_INC_CONF'));
      return;
    }
  }
  await dataService.post('/sms/wells/service/returning-goods-store/confirmation-type', checkedRows);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sapCd' }, // SAP코드
    { fieldName: 'itmPdCd' }, // 품목상품코드,
    { fieldName: 'cstSvAsnNo' }, // 고객서비스배정내역,
    { fieldName: 'itmPdNm' }, // 품목상품명
    { fieldName: 'itemGrNm' }, // 품목그룹명
    { fieldName: 'itemGr' }, // 품목그룹
    { fieldName: 'istDt' }, // 설치일자
    { fieldName: 'reqdDt' }, // 철거요청일자
    { fieldName: 'vstFshDt' }, // 작업일자
    { fieldName: 'rtngdConfYn' }, // 반품확인여부
    { fieldName: 'useDay' }, // 사용일수
    { fieldName: 'useMths' }, // 사용개월
    { fieldName: 'refurbishYn' }, // 리퍼
    { fieldName: 'fnlItmGdCd' }, // 등급
    { fieldName: 'useQty' }, // 수량
    { fieldName: 'refrAsRcpYn' }, // 리퍼접수
    { fieldName: 'cntrDtlNo' }, // 고객상세번호
    { fieldName: 'cntrNo' }, // 고객번호
    { fieldName: 'cntrSn' }, // 고객순번
    { fieldName: 'rcgvpKnm' }, // 고객명
    { fieldName: 'sellTpNm' }, // 판매유형
    { fieldName: 'mngtUnitNm' }, // 관리유형
    { fieldName: 'referArtc' }, // 참고사항
    { fieldName: 'stkrPrntYn' }, // 스티커출력여부
    { fieldName: 'svBizDclsfCd' }, // 서비스업무세분류코드
    { fieldName: 'svBizDclsfNm' }, // 업무유형
    { fieldName: 'ostrConfDt1' }, // 출고확인일자
    { fieldName: 'ostrConfDt' }, // 출고확인일자
    { fieldName: 'ostrDt' }, // 전산반품
    { fieldName: 'rtngdProcsTpCd1' }, // 반품처리유형코드
    { fieldName: 'rtngdProcsTpCd' }, // 반품처리유형코드
    { fieldName: 'rmkCn' }, // 특이사항
    { fieldName: 'cntrNoNew' }, // 신규고객번호
    { fieldName: 'barCd' }, // 제조번호
    { fieldName: 'asLctNm' }, // as위치코드명
    { fieldName: 'asphnNm' }, // as현상코드명
    { fieldName: 'asCausNm' }, // as원인코드
    { fieldName: 'svProcsCn' }, // 서비스처리내용
    { fieldName: 'ichrPrtnrNo' }, // 담당엔지니어사번
    { fieldName: 'empNm' }, // 담당엔지니어명
    { fieldName: 'rcpIchrPrtnrNo' }, // 철거요청사번
    { fieldName: 'fstRgstUserNm' }, // 철거요청자명
    { fieldName: 'rcstDv' }, // 접수자구분
    { fieldName: 'cnslMoCn' }, // 접수내역
    { fieldName: 'ogNm' }, // 접수자소속
    { fieldName: 'prtnrNm' }, // 접수자명
    { fieldName: 'badDvNm' }, // 불량구분
    { fieldName: 'rtngdRvpyProcsYn' }, // 반품수불처리여부
    { fieldName: 'wkWareNo' }, // 작업창고번호
    { fieldName: 'wkOstrSn' }, // 작업출고순번
    { fieldName: 'errorCheck' }, // 등급오류체크
    { fieldName: 'itemKnd' }, // 품목구분코드
    { fieldName: 'mgtUnt' }, // 관리단위

  ];

  const columns = [
    { fieldName: 'sapCd', header: t('MSG_TXT_SAP_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdCd', header: t('MSG_TXT_ITM_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'itmPdNm', header: t('TXT_MSG_MAT_PD_NM'), width: '170', styleName: 'text-left' },
    { fieldName: 'itemGrNm', header: t('MSG_TXT_PD_GRP'), width: '170', styleName: 'text-left', visible: false },
    { fieldName: 'itemGr', header: t('MSG_TXT_PD_GRP_CD'), width: '170', styleName: 'text-left', visible: false, autoFilter: false },
    { fieldName: 'istDt', header: t('MSG_TXT_IST_DT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'reqdDt', header: t('MSG_TXT_REQD_RQDT'), width: '120', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'vstFshDt', header: t('MSG_TXT_WK_DT'), width: '170', styleName: 'text-center', datetimeFormat: 'date' },
    { fieldName: 'rtngdConfYn', header: t('MSG_TXT_RTNGD_CONF_YN'), width: '100', styleName: 'text-center' },
    { fieldName: 'useDay', header: t('MSG_TXT_USE_DAY'), width: '100', styleName: 'text-right' },
    { fieldName: 'useMths', header: t('MSG_TXT_USE_MCNT'), width: '100', styleName: 'text-right' },
    { fieldName: 'refurbishYn', header: t('MSG_TXT_REFR'), width: '100', styleName: 'text-center' },
    { fieldName: 'fnlItmGdCd', header: t('MSG_TXT_GD'), width: '100', styleName: 'text-center', options: codes.PD_GD_CD },
    { fieldName: 'useQty', header: t('MSG_TXT_QTY'), width: '100', styleName: 'text-right' },
    { fieldName: 'refrAsRcpYn', header: t('MSG_TXT_REFR_RCP'), width: '100', styleName: 'text-center' },
    { fieldName: 'cntrDtlNo', header: t('MSG_TXT_CNTR_DTL_NO'), width: '150', styleName: 'rg-button-link text-center', renderer: { type: 'button' }, preventCellItemFocus: true },
    { fieldName: 'rcgvpKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' },
    { fieldName: 'sellTpNm', header: t('MSG_TXT_SEL_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'mngtUnitNm', header: t('MSG_TXT_MGT_TYP'), width: '100', styleName: 'text-center' },
    { fieldName: 'referArtc', header: t('MSG_TXT_REFER_ARTC'), width: '150', styleName: 'text-center' },
    { fieldName: 'svBizDclsfNm', header: t('MSG_TXT_TASK_TYPE'), width: '100', styleName: 'text-center' },
    { fieldName: 'ostrConfDt',
      header: t('MSG_TXT_CONF_DT'),
      width: '150',
      styleName: 'text-center',
      rules: 'required',
      datetimeFormat: 'yyyy-MM-dd',
      editable: true,
      editor: { type: 'btdate' },
    },

    { fieldName: 'ostrDt',
      header: t('MSG_TXT_EDP_RTNGD'),
      width: '150',
      styleName: 'text-center',
      datetimeFormat: 'yyyy-MM-dd',
      // styleCallback: setCellEditableFalse,
    },
    { fieldName: 'rtngdProcsTpCd',
      header: t('MSG_TXT_RTNGD_PROCS_TP'),
      width: '100',
      styleName: 'text-center',
      rules: 'required',
      options: codes.RTNGD_PROCS_TP_CD,
      editable: true,
      editor: { type: 'list' },
      // styleCallback: setCellEditableFalse,
    },
    { fieldName: 'rmkCn', header: t('MSG_TXT_UNUITM'), width: '150', styleName: 'text-center', editable: true },
    { fieldName: 'cntrNoNew', header: t('MSG_TXT_NW_CST_NO'), width: '100', styleName: 'text-center' },
    { fieldName: 'barCd', header: t('MSG_TXT_MNFT_NO'), width: '150', styleName: 'text-center' },
    { fieldName: 'asLctNm', header: t('MSG_TXT_LCT'), width: '100', styleName: 'text-center' },
    { fieldName: 'asphnNm', header: t('MSG_TXT_PHN'), width: '100', styleName: 'text-center' },
    { fieldName: 'asCausNm', header: t('MSG_TXT_CAUS'), width: '100', styleName: 'text-center' },
    { fieldName: 'svProcsCn', header: t('MSG_TIT_APRV_DTLS'), width: '397', styleName: 'text-center' },
    { fieldName: 'ichrPrtnrNo', header: t('MSG_TXT_ICHR_EGER'), width: '100', styleName: 'text-center' },
    { fieldName: 'empNm', header: t('MSG_TXT_ICHR_EGER_NM'), width: '120', styleName: 'text-center' },
    { fieldName: 'rcpIchrPrtnrNo', header: t('MSG_TXT_REQD_AK_EMPNO'), width: '150', styleName: 'text-center' },
    { fieldName: 'fstRgstUserNm', header: t('MSG_TXT_REQD_AK_NM'), width: '150', styleName: 'text-center' },
    { fieldName: 'rcstDv', header: t('MSG_TXT_RCST_DV'), width: '100', styleName: 'text-center' },
    { fieldName: 'cnslMoCn', header: t('MSG_TXT_RCP_IZ'), width: '397', styleName: 'text-left' },
    { fieldName: 'ogNm', header: t('MSG_TXT_RCST_BLG_IST'), width: '150', styleName: 'text-center' },
    { fieldName: 'prtnrNm', header: t('MSG_TXT_RCST_NM_IST'), width: '100', styleName: 'text-center' },
    { fieldName: 'badDvNm', header: t('MSG_TXT_BAD_DV'), width: '100', styleName: 'text-center' },
    // { fieldName: 'asLctNm', header: '고장위치', width: '100', styleName: 'text-center' },
    // { fieldName: 'asphnNm', header: '고장현상', width: '100', styleName: 'text-center' },
    // { fieldName: 'asCausNm', header: '위치상세', width: '100', styleName: 'text-center' },

  ];

  const columnLayout = [
    'sapCd',
    'itmPdCd',
    'itmPdNm',
    'itemGrNm',
    'itemGr',
    'istDt',
    'reqdDt',
    'vstFshDt',
    'rtngdConfYn',
    'useDay',
    'useMths',
    'refurbishYn',
    'fnlItmGdCd',
    'useQty',
    'refrAsRcpYn',
    'cntrDtlNo',
    'rcgvpKnm',
    'sellTpNm',
    'mngtUnitNm',
    'referArtc',
    'svBizDclsfNm',
    'ostrConfDt',
    'ostrDt',
    'rtngdProcsTpCd',
    'rmkCn',
    'cntrNoNew',
    'barCd',
    'asLctNm',
    'asphnNm',
    'asCausNm',
    'svProcsCn',
    'ichrPrtnrNo',
    'empNm',
    // 'empNm',
    { direction: 'horizontal', items: ['rcpIchrPrtnrNo', 'fstRgstUserNm'], header: { text: t('MSG_TXT_REQD_AK_EMPNO_NM') }, hideChildHeaders: true },
    'rcstDv',
    // 'fstRgstUserNm',
    'cnslMoCn',
    'ogNm',
    'prtnrNm',
    'badDvNm',
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.setColumnLayout(columnLayout);

  view.checkBar.visible = true;
  view.rowIndicator.visible = true;
  view.setFixedOptions({ colCount: 4, resizable: true });
  view.editOptions.columnEditableFirst = true;
  view.filteringOptions.enabled = false;

  view.setRowStyleCallback((grid, item) => {
    const ret = {};
    const { ostrConfDt1 } = gridUtil.getRowValue(grid, item.index);
    // const strRtngdProcsTpCd = grid.getValue(item.index, 'rtngdProcsTpCd');
    // const strOstrDt = grid.getValue(item.index, 'ostrDt');
    // , rtngdRvpyProcsYn

    if (ostrConfDt1) {
      ret.editable = false;
    }

    // if (rtngdRvpyProcsYn !== 'Y') {
    //   ret.editable = false;
    // }
    return ret;
  });

  const f = function checked(dataSource, item) {
    if ((data.getValue(item.dataRow, 'rtngdRvpyProcsYn') !== 'N') || (data.getValue(item.dataRow, 'ostrConfDt1') !== undefined)) {
      return false;
    }
    return true;
  };

  view.setCheckBar({ checkableCallback: f });

  view.onCellItemClicked = async (g, { column, itemIndex }) => {
    if (column === 'cntrDtlNo') {
      const cntrNo = g.getValue(itemIndex, 'cntrNo');
      const cntrSn = g.getValue(itemIndex, 'cntrSn');

      await popupUtil.open(`/popup#/service/wwsnb-individual-service-list?cntrNo=${cntrNo}&cntrSn=${cntrSn}`, { width: 2000, height: 1100 }, false);
    }
  };
});

</script>
