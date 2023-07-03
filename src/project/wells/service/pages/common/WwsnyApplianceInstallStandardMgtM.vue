<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
1. 모듈 : SNY
2. 프로그램 ID : WwsnyApplianceInstallStandardMgtM(K-W-SV-U-0303M01) - 환경가전 설치기준 관리
3. 작성자 : jaehunlee
4. 작성일 : 2023.06.24
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
- 환경가전 설치기준 관리 (http://localhost:3000/#/service/wwsny-appliance-install-standard-mgt)
 ****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      @reset="onClickReset"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_DGR1_CLSF')"
        >
          <kw-select
            v-model="searchParams.dgr1ClsfCd"
            :options="codes.DGR1_CLSF_CD"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_DGR2_CLSF')"
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
      <h3>{{ $t('MSG_TXT_SRC_WATER') }}</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_IST_PRNCP')"
          >
            <kw-input
              v-model="baseCnData.baseCn11"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_GRND_WATER')"
          >
            <kw-input
              v-model="baseCnData.baseCn12"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_RUST')"
          >
            <kw-input
              v-model="baseCnData.baseCn13"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />
      <h3>{{ $t('MSG_TXT_IST_CNDT') }}</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_MIN_BASE_OLQ_WPRS')"
          >
            <kw-input
              v-model="baseCnData.baseCn21"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_MIN_BASE_SRTFL_H')"
          >
            <kw-input
              v-model="baseCnData.baseCn22"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_MAX_BASE_WPRS')"
          >
            <kw-input
              v-model="baseCnData.baseCn23"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_PRES_RELIEF_VALVE')"
          >
            <kw-input
              v-model="baseCnData.baseCn24"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_CHG_WPRS')"
          >
            <kw-input
              v-model="baseCnData.baseCn25"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <h3>{{ $t('MSG_TXT_MAX_DSTN') }}</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_LNTH')"
          >
            <kw-input
              v-model="baseCnData.baseCn31"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>

      <kw-separator />

      <h3>{{ $t('MSG_TXT_ENVR') }}</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_FREEZE_BURST')"
          >
            <kw-input
              v-model="baseCnData.baseCn41"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_BZ_ITM')"
          >
            <kw-input
              v-model="baseCnData.baseCn42"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_AN_ILD_MNT_AREA')"
          >
            <kw-input
              v-model="baseCnData.baseCn43"
              type="textarea"
              row="3"
            />
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_ETC')"
          >
            <kw-input
              v-model="baseCnData.baseCn44"
              type="textarea"
              row="3"
            />
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <kw-separator />

      <h3>{{ $t('MSG_TXT_IST_SPPT') }}</h3>

      <kw-form :cols="2">
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_IST_SPPT')"
          >
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
import { codeUtil, useDataService, useGlobal } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const codes = await codeUtil.getMultiCodes(
  'DGR1_CLSF_CD',
  'DGR2_CLSF_CD',
);

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();
/*
 *  Search Parameter
 */
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

const saveData = [];
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
let cachedParams;
async function fetchData() {
  const res = await dataService.get('/sms/wells/service/install-standard', { params: { ...cachedParams } });
  // console.log(cachedParams);
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
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn11,
    hclsfCd: '1',
    lclsfCd: '11',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn12,
    hclsfCd: '1',
    lclsfCd: '12',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn13,
    hclsfCd: '1',
    lclsfCd: '13',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn21,
    hclsfCd: '2',
    lclsfCd: '21',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn22,
    hclsfCd: '2',
    lclsfCd: '22',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn23,
    hclsfCd: '2',
    lclsfCd: '23',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn24,
    hclsfCd: '2',
    lclsfCd: '24',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn25,
    hclsfCd: '2',
    lclsfCd: '25',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn31,
    hclsfCd: '3',
    lclsfCd: '31',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn41,
    hclsfCd: '4',
    lclsfCd: '41',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn42,
    hclsfCd: '4',
    lclsfCd: '42',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn43,
    hclsfCd: '4',
    lclsfCd: '43',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn44,
    hclsfCd: '4',
    lclsfCd: '44',
  });
  saveData.push({
    dgr1ClsfCd: searchParams.value.dgr1ClsfCd,
    dgr2ClsfCd: searchParams.value.dgr2ClsfCd,
    baseCn: baseCnData.value.baseCn51,
    hclsfCd: '5',
    lclsfCd: '51',
  });

  // console.log(saveData);
  await dataService.post('/sms/wells/service/install-standard', saveData);
  notify(t('MSG_ALT_SAVE_DATA'));
  await fetchData();
}

</script>
