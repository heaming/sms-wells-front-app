<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfActivityGoodsApplicationPlRegM - 활동물품 신청(플래너)
3. 작성자 : jisung you
4. 작성일 : 2023.07.28
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-활동물품 신청(플래너)
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="result-area">
      <kw-list
        separator
        item-padding="10px 0 0"
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
                <span class="text-bold kw-font-pt18">{{ $t('MSG_TXT_ACTI_ITM_APLC') }}</span>
                <div class="inline-block float-right">
                  <kw-btn
                    :label="t('MSG_TXT_DDTN_IZ')"
                    dense
                    @click="onClickPopup('04',null)"
                  />
                  <kw-btn
                    :label="t('MSG_TXT_CONF_ARTC')"
                    dense
                    class="ml8"
                    @click="onClickPopup('05',null)"
                  />
                </div>
              </kw-item-label>
            </kw-item-section>
          </template>
          <div class="mt10">
            <kw-form
              ref="frmMainRef"
              :cols="3"
            >
              <kw-form-row>
                <kw-form-item
                  :label="t('MSG_TXT_ITM')"
                  required
                >
                  <kw-select
                    v-model="frmMainData.actiGdsSetCd"
                    :options="actiGdsSns"
                    first-option="select"
                    :label="t('MSG_TXT_ITM')"
                    rules="required"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="t('MSG_TXT_QTY')"
                  required
                >
                  <kw-select
                    v-model="frmMainData.aplcQty"
                    rules="required"
                    :options="qtyOptions"
                    :label="t('MSG_TXT_QTY')"
                  />
                </kw-form-item>
                <kw-form-item
                  :label="$t('MSG_TXT_SZ')"
                  required
                >
                  <kw-select
                    v-model="frmMainData.actiGdsStddCd"
                    rules="required"
                    :options="actiGdsStddCds"
                    :label="$t($t('MSG_TXT_SZ'))"
                  />
                </kw-form-item>
              </kw-form-row>
            </kw-form>
          </div>
          <kw-separator class="mt20 mb20" />
          <div class="text-right">
            <kw-btn
              :label="$t('MSG_BTN_APPL')"
              primary
              default
              @click="onClickSave"
            />
          </div>
        </kw-expansion-item>
        <kw-separator class="mt20 mb0" />
      </kw-list>
      <h3>{{ $t('MSG_TXT_APLC_HIST') }} </h3>
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
        </template>
      </kw-action-top>
      <div>
        <div class="row q-gutter-sm">
          <kw-card
            v-for="(item, idx) in pageDatas"
            :key="idx"
          >
            <div class="row items-center justify-between">
              <kw-chip
                v-if="item.actiGdsAplcStatCd == '01'"
                :label="$t('MSG_TXT_APLC')"
                color="primary"
                outline
              />
              <kw-chip
                v-if="item.actiGdsAplcStatCd == '02'"
                :label="$t('MSG_TXT_CANCEL')"
                color="placeholder"
                outline
              />
              <kw-chip
                v-if="item.actiGdsAplcStatCd == '03'"
                :label="$t('MSG_TXT_RTNGD')"
                color="placeholder"
                outline
              />
            </div>

            <h3 class="mt20 mb12">
              {{ $t('MSG_TXT_UNIFORM') }} - ${{ item.actiGdsNm }}$
            </h3>

            <kw-separator class="my20" />

            <ul class="card-text mb20">
              <li>
                <p>  {{ $t('MSG_TXT_APPL_DT') }} :</p>
                <span>{{ stringUtil.getDateFormat(item.aplcDtS) }}</span>
              </li>
              <li v-if="item.actiGdsAplcStatCd == '02'">
                <p> {{ $t('MSG_TXT_CANC_DT') }} :</p>
                <span>{{ stringUtil.getDateFormat(item.aplcDt) }}</span>
              </li>
              <li v-if="item.actiGdsAplcStatCd == '03'">
                <p>{{ $t('MSG_TXT_RTNGD_DT') }} :</p>
                <span>{{ stringUtil.getDateFormat(item.sppDt) }}</span>
              </li>
              <li>
                <p>{{ $t('MSG_TXT_QTY') }} :</p>
                <span>{{ item.aplcQty }}</span>
              </li>
              <li>
                <p>{{ $t('MSG_TXT_SZ') }} :</p>
                <span>{{ item.actiGdsStddNm }}</span>
              </li>
            </ul>
            <kw-card-actions>
              <kw-btn
                v-if="item.actiGdsAplcStatCd == '01'"
                secondary
                :label="$t('MSG_BTN_CANCEL')"
                padding="12px"
                @click="onClickPopup('02',item)"
              />
              <kw-btn
                v-if="item.actiGdsAplcStatCd == '01'"
                secondary
                :label="$t('MSG_TXT_RTNGD')"
                padding="12px"
                @click="onClickPopup('03',item)"
              />
              <kw-btn
                v-if="item.actiGdsAplcStatCd == '02'"
                secondary
                :label="$t('MSG_TXT_CAN_INF')"
                padding="12px"
                @click="onClickPopup('021',item)"
              />
              <kw-btn
                v-if="item.actiGdsAplcStatCd == '03'"
                secondary
                :label="$t('MSG_TXT_RTNGD_INF')"
                padding="12px"
                @click="onClickPopup('031',item)"
              />
            </kw-card-actions>
          </kw-card>
        </div>
      </div>
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
      />
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import { codeUtil, useDataService, useGlobal, useMeta, stringUtil, getComponentType } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { modal, notify } = useGlobal();
const { getConfig, getUserInfo } = useMeta();
const { t } = useI18n();
const dataService = useDataService();
const userInfo = getUserInfo();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));
const pageDatas = ref();
const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);
const frmMainData = ref({
  actiGdsSetCd: '',
  actiGdsSn: '',
  actiGdsStddCd: '',
  aplcQty: '',
  ogTpCd: userInfo.ogTpCd,
  actiGdsCd: '',
  actiGdsStddDvId: '',
  aplcYn: 'Y',

});
const searchParams = ref({
  ogTpCd: userInfo.ogTpCd, /* 조직유형코드 */
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

const actiGdsSns = ref();
const actiGdsStddCds = ref();

const qtyOptions = ref([]);

for (let i = 1; i <= 5; i += 1) {
  const rowData = { codeId: i, codeName: i };
  qtyOptions.value.push(rowData);
}

let cachedParams;
async function optionData() {
  cachedParams = cloneDeep(frmMainData.value);
  const { data } = await dataService.get('/sms/wells/competence/business/activity/base-codes', { params: { ...cachedParams } });

  return data;
}

actiGdsSns.value = await optionData();

async function optionDataDtl() {
  cachedParams = cloneDeep(frmMainData.value);
  const { data } = await dataService.get('/sms/wells/competence/business/activity/dtl-codes', { params: { ...cachedParams } });

  return data;
}
watch(() => frmMainData.value.actiGdsSetCd, async (newVal) => {
  if (newVal) {
    const eactiGdsSnsData = actiGdsSns.value.filter((v) => [newVal].includes(v.codeId));
    const actiGdsSetCdData = eactiGdsSnsData[0].codeId.split('-');
    frmMainData.value.ogTpCd = actiGdsSetCdData[0];
    frmMainData.value.actiGdsCd = actiGdsSetCdData[1];
    frmMainData.value.actiGdsSn = actiGdsSetCdData[2];
    frmMainData.value.actiGdsStddDvId = eactiGdsSnsData[0].actiGdsStddDvId;
    actiGdsStddCds.value = await optionDataDtl();
  }
});

async function fetchPages() {
  cachedParams = cloneDeep(frmMainData.value);
  const res = await dataService.get('/sms/wells/competence/business/activity/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;
  console.log('pageInfo.value', pageInfo.value);

  pageDatas.value = products;
  console.log('pageDatas.value', pageDatas.value);
}

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchPages();
};

async function onClickSave() {
  if (!await frmMainRef.value.validate()) { return; }
  const saveParams = [];
  saveParams.push(frmMainData.value);
  console.log('saveParams', saveParams);
  await dataService.post('/sms/wells/competence/business/activity/application', saveParams);
  notify(t('MSG_ALT_SAVE_DATA'));
  await onClickSearch();
}

async function onClickPopup(type, item) {
  const readonly = ['021', '031'].includes(type);

  if (type === '02' || type === '021') {
    const res = await modal({
      component: 'WwpsfCancelRegistrationRegP',
      componentProps: { checkedRows: [item], readonly },
    });
    console.log('취소', res.result);
    if (res.result) {
      console.log(res.result);
    }
  } else if (type === '03' || type === '031') {
    const res = await modal({
      component: 'WwpsfReturningRegistrationRegP',
      componentProps: { checkedRows: [item], readonly },
    });
    console.log('반품', res.result);
    if (res.result) {
      console.log(res.result);
    }
  } else if (type === '04') {
    const res = await modal({
      component: 'WwpsfActivityGoodsDeductionInformationDtlP',
      componentProps: { },
    });

    if (res.result) {
      console.log(res.result);
    }
  } else if (type === '05') {
    const res = await modal({
      component: 'WwpsfActivityGoodsConfirmationArticlesDtlP',
      componentProps: { },
    });

    if (res.result) {
      console.log(res.result);
    }
  }
}

onMounted(async () => {
  await onClickSearch();
});

</script>
