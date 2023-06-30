<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈', '서비스', '기준정보현황 ', '환경가전 설치기준 관리']"
      />
    </template>
    <!-- rev:230420 kw-search 안에 one-row추가 -->
    <kw-search
      one-row
      @reset="onClickReset"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          label="1차분류"
        >
          <kw-select
            v-model="searchParams.dgr1ClsfCd"
            :options="codes.DGR1_CLSF_CD"
          />
        </kw-search-item>
        <kw-search-item
          label="2차분류"
        >
          <kw-select
            v-model="searchParams.dgr2ClsfCd"
            :options="filterCodes.filterDgr2ClsfCd"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <!-- 저장 -->
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          grid-action
          @click="onClickSave"
        />
      </kw-action-top>
      <h3>원수</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item label="설치원칙">
            <kw-input
              v-model="baseCnData.baseCn11"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item label="지하수">
            <kw-input
              v-model="baseCnData.baseCn12"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item label="녹물">
            <kw-input
              v-model="baseCnData.baseCn13"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <h3>설치조건</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item label="최소 기준(유량/수압)">
            <kw-input
              v-model="baseCnData.baseCn21"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item label="최소 기준 미달 시">
            <kw-input
              v-model="baseCnData.baseCn22"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item label="최대 기준(수압)">
            <kw-input
              v-model="baseCnData.baseCn23"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item label="감압밸브">
            <kw-input
              v-model="baseCnData.baseCn24"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item label="변동수압">
            <kw-input
              v-model="baseCnData.baseCn25"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <h3>최대거리</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item label="길이(원수->제품)">
            <kw-input
              v-model="baseCnData.baseCn31"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <h3>환경</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item label="동파">
            <kw-input
              v-model="baseCnData.baseCn41"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item label="업종">
            <kw-input
              v-model="baseCnData.baseCn42"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item label="도서산간 지역">
            <kw-input
              v-model="baseCnData.baseCn43"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item label="기타">
            <kw-input
              v-model="baseCnData.baseCn44"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />

      <h3>설치지원</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item label="설치지원">
            <kw-input
              v-model="baseCnData.baseCn51"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useDataService, useModal, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const codes = await codeUtil.getMultiCodes(
  'DGR1_CLSF_CD',
  'DGR2_CLSF_CD',
);

const { t } = useI18n();
const { ok } = useModal();
const { confirm, notify } = useGlobal();

const dataService = useDataService();
let cachedParams;

const searchParams = ref({
  dgr1ClsfCd: '',
  dgr2ClsfCd: '',
});

const filterCodes = ref({
  filterDgr2ClsfCd: [],
});

const baseCnData = ref({
  dgr1ClsfCd: '',
  dgr2ClsfCd: '',
  baseCn11: '',
  baseCn12: '',
  baseCn13: '',
  baseCn21: '',
  baseCn22: '',
  baseCn23: '',
  baseCn24: '',
  baseCn25: '',
  baseCn31: '',
  baseCn41: '',
  baseCn42: '',
  baseCn43: '',
  baseCn44: '',
  baseCn51: '',
});
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

async function fetchData() {
  const res = await dataService.get('/sms/wells/service/install-standard/searching', { params: { ...cachedParams } });
  console.log(cachedParams);
  baseCnData.value = res.data;
}

const onChangeDgr1ClsfCd = async () => {
  const strDgr1ClsfCd = searchParams.value.dgr1ClsfCd;

  if (strDgr1ClsfCd === '1') {
    filterCodes.value.filterDgr2ClsfCd = codes.DGR2_CLSF_CD.filter((v) => ['11'].includes(v.codeId));
    searchParams.value.dgr2ClsfCd = '11';
  } else if (strDgr1ClsfCd === '2') {
    filterCodes.value.filterDgr2ClsfCd = codes.DGR2_CLSF_CD.filter((v) => ['21', '22', '23'].includes(v.codeId));
    searchParams.value.dgr2ClsfCd = '21';
  } else if (strDgr1ClsfCd === '21') {
    filterCodes.value.filterDgr2ClsfCd = codes.DGR2_CLSF_CD.filter((v) => ['211', '212', '213'].includes(v.codeId));
    searchParams.value.dgr2ClsfCd = '211';
  } else if (strDgr1ClsfCd === '4') {
    filterCodes.value.filterDgr2ClsfCd = codes.DGR2_CLSF_CD.filter((v) => ['41'].includes(v.codeId));
    searchParams.value.dgr2ClsfCd = '41';
  }
};

function searchConditionReset() {
  searchParams.value.dgr1ClsfCd = '1';
  searchParams.value.dgr2ClsfCd = '11';
}

async function onClickSearch() {
  cachedParams = cloneDeep(searchParams.value);
  await fetchData();
}

function onClickReset() {
  searchConditionReset();
}

onMounted(() => {
  searchConditionReset();
});

watch(() => searchParams.value.dgr1ClsfCd, (val) => {
  if (searchParams.value.dgr1ClsfCd !== val) {
    searchParams.value.dgr1ClsfCd = val;
  }
  onChangeDgr1ClsfCd();
});

async function onClickSave() {
  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }
  await dataService.post('/sms/wells/service/install-standard', baseCnData.value);
  ok();
  await notify(t('MSG_ALT_SAVE_DATA'));
}

</script>
