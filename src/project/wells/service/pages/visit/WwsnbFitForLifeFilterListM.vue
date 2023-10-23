<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB
2. 프로그램 ID : [W-SV-U-0044M01] WwsnbFitForLifeFilterListM - 차기 방문 스케쥴 및 생활맞춤형 필터 조회
3. 작성자 : yeongjoong.kim
4. 작성일 : 2023.06.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 고객센터에서 고객 상담시 특정 고객 생활맞춤형 필터를 조회하고 필터를 선택하여 변경한다.
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="normal-area normal-area--button-set-bottom pt30">
      <kw-observer ref="obsMainRef">
        <kw-form :cols="2">
          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_CNTR_NO')">
              <!--계약번호-->
              <p>{{ filterInfo.cntr }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
              <!--성명-->
              <p>{{ filterInfo.rcgvpKnm }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_ALT_VST_DT')">
              <!--변경방문 예정일자-->
              <p>{{ stringUtil.getDateFormat(filterInfo.vstDuedt) }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_ALT_DDLN_DT')">
              <!--변경마감일자-->
              <p>{{ stringUtil.getDateFormat(filterInfo.altDeadline) }} {{ $t('MSG_TXT_CAN_ALT_BEFORE_DAY') }}</p>
            </kw-form-item><!--까지 변경가능 (B/S예정30일전까지)-->
          </kw-form-row>

          <kw-form-row>
            <kw-form-item :label="$t('MSG_TXT_WK_CLS')">
              <!--작업구분-->
              <p>{{ filterInfo.workNm }}</p>
            </kw-form-item>
            <kw-form-item :label="$t('MSG_TXT_CUR_FILTER')">
              <!--현재필터-->
              <p>{{ filterInfo.svpdNmKor }}</p>
            </kw-form-item>
          </kw-form-row>

          <kw-form-row>
            <kw-form-item
              :label="$t('MSG_TXT_ALT_FILTER')"
              :colspan="2"
            >
              <!--변경필터-->
              <kw-option-group
                v-model="partPdCd"
                type="radio"
                :options="filterItems"
                option-value="chPdctPdCd"
                option-label="svpdNmKor"
              />
            </kw-form-item>
          </kw-form-row>
        </kw-form>
      </kw-observer>
      <kw-separator />
      <h3>{{ $t('MSG_TXT_RGST_CH_HIST') }}</h3><!--등록/변경이력 정보-->
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
      </kw-action-top>

      <kw-grid
        ref="grdMainRef"
        :visible-rows="10"
        name="grdMain"
        class="mt20"
        @init="initGrid"
      />

      <div class="button-set--bottom">
        <!-- <div class="button-set--bottom-left">
          <kw-btn
            secondary
            :label="$t('MSG_TXT_PREV')"
            @click="onClickBack"
          />
        </div>이전 -->
        <div class="button-set--bottom-right">
          <kw-btn
            primary
            :label="$t('MSG_TXT_SAVE')"
            @click="onClickSave"
          /><!--저장-->
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, stringUtil, getComponentType, useGlobal } from 'kw-lib';
// import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { confirm, notify } = useGlobal();
// const router = useRouter();

const props = defineProps({
  cntrNo: {
    type: String,
    required: true,
  },
  cntrSn: {
    type: Number,
    required: true,
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const filterInfo = ref({
  altDeadline: '',
  cntr: '',
  cntrNo: '',
  cntrSn: '',
  partPdCd: '',
  rcgvpKnm: '',
  svpdNmKor: '',
  vstDuedt: '',
  workNm: '',
});

const filterItems = ref([{
  chPdctPdCd: '',
  cntrNo: '',
  cntrSn: 0,
  filtCmuCdv: '',
  filtCmuEpl: '',
  filtCmuNm: '',
  pdctPdCd: '',
  svPdCd: '',
  svpdNmKor: '',
}]);

const partPdCd = ref('');

const obsMainRef = ref(getComponentType('KwObserver'));

async function fetchFiterInfo(cntrNo, cntrSn) {
  const { data } = await dataService.get('/sms/wells/service/customer-center/next-bs-cust-info', { params: { cntrNo, cntrSn } });
  return data;
}

async function fetchFiterItems(cntrNo, cntrSn, vstDuedt) {
  const { data } = await dataService.get('/sms/wells/service/customer-center/next-bs-cust-info/filter-items', { params: { cntrNo, cntrSn, vstDuedt } });

  obsMainRef.value.init();

  return data;
}

const grdMainRef = ref(getComponentType('KwGrid'));
const totalCount = ref(0);

async function fetchHistories(cntrNo, cntrSn) {
  const { data } = await dataService.get('/sms/wells/service/customer-center/next-bs-cust-info/histories', { params: { cntrNo, cntrSn } });

  totalCount.value = data.length;

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(data);
  view.clearCurrent();
}

async function initInfo() {
  const { cntrNo, cntrSn } = props;

  filterInfo.value = await fetchFiterInfo(cntrNo, cntrSn);
  partPdCd.value = filterInfo.value.partPdCd;

  filterItems.value = await fetchFiterItems(cntrNo, cntrSn, filterInfo.value.vstDuedt);
  await fetchHistories(cntrNo, cntrSn);
}

async function saveFilter(cntrNo, cntrSn, vstPromDt, partPdCdBefore, partPdCdAfter) {
  await dataService.post('/sms/wells/service/customer-center/next-bs-cust-info/filter', {
    cntrNo, cntrSn, vstPromDt, partPdCdBefore, partPdCdAfter,
  });
}

// function onClickBack() {
//   window.history.back();
// }

async function onClickSave() {
  if (await obsMainRef.value.alertIfIsNotModified()) return;
  if (!await confirm(t('MSG_ALT_IS_SAV_DATA'))) return;

  const { cntrNo, cntrSn } = props;
  const { vstDuedt, partPdCd: partPdCdBefore } = filterInfo.value;
  await saveFilter(cntrNo, cntrSn, vstDuedt, partPdCdBefore, partPdCd.value);
  notify(t('MSG_ALT_SVE_DATA'));

  await initInfo();
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
function initGrid(data, view) {
  const fields = [
    { fieldName: 'cntrNo' },
    { fieldName: 'cntrSn' },
    { fieldName: 'fstRgstDt' },
    { fieldName: 'cntr' },
    { fieldName: 'vstPromDt' },
    { fieldName: 'request' },
    { fieldName: 'svpdNmKor' },
    { fieldName: 'usrNm' },
    { fieldName: 'channel' },
    { fieldName: 'status' },
  ];

  const columns = [
    { fieldName: 'fstRgstDt', header: t('MSG_TXT_AK_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 요청일자
    { fieldName: 'cntr',
      header: t('MSG_TXT_CNTR_NO'),
      width: '150',
      // styleName: 'rg-button-link text-center',
      // renderer: { type: 'button' },
    }, // 계약번호
    { fieldName: 'vstPromDt', header: t('MSG_TXT_APY_EXP_D'), width: '100', styleName: 'text-center', datetimeFormat: 'yyyy-MM-dd' }, // 적용예정일
    { fieldName: 'request', header: t('MSG_TXT_AK'), width: '50', styleName: 'text-center' }, // 요청
    { fieldName: 'svpdNmKor', header: t('MSG_TXT_RGST_FILT'), width: '200' }, // 등록필터
    { fieldName: 'usrNm', header: t('MSG_TXT_RGST_USR'), width: '70', styleName: 'text-center' }, // 등록자
    { fieldName: 'channel', header: t('MSG_TXT_CHNL'), width: '70', styleName: 'text-center' }, // 채널
    { fieldName: 'status', header: t('MSG_TXT_STT'), width: '50', styleName: 'text-center' }, // 상태
  ];

  data.setFields(fields);
  view.setColumns(columns);
  view.rowIndicator.visible = true; // create number indicator column

  view.onCellItemClicked = (grid, clickData) => {
    if (clickData.column === 'cntr') {
      // const param = { cntrNo: grid.getDataSource()
      //   .getValue(clickData.dataRow, 'cntrNo'),
      // cntrSn: grid.getDataSource().getValue(clickData.dataRow, 'cntrSn') };
      // router.push({ path: '/service/wwsnb-individual-service-list', state: { stateParam: param } });
    }
  };
}

onMounted(async () => {
  await initInfo();
});
</script>
