<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfBusinessCardMgtM - 명함첩관리
3. 작성자 : jisung you
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-명함첩관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      one-row
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_ELIGIBILITY')"
        >
          <kw-input
            v-model.trim="searchParams.fnm"
            :placeholder="$t('MSG_TXT_NM_TEL_N0')"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="pageInfo.totalCount"
          />
        </template>
      </kw-action-top>
      <div>
        <div class="row q-gutter-sm">
          <kw-card>
            <div
              class="w150 center"
              style="margin: 70px auto 0;"
            >
              <kw-btn
                icon="plus_24"
                style="font-size: 40px;"
                borderless
                @click="onClickPopup"
              />
              <p class="kw-font-pt18 pt10">
                {{ $t('MSG_BTN_NW_BCD_RGST') }}
              </p>
            </div>
          </kw-card>

          <kw-card
            v-for="(item, idx) in cards"
            :key="idx"
            @click="onClickViewPopup(item)"
          >
            <kw-avatar
              font-size="18px"
              color="line-bg"
              style="width: 100%;height: 150px;"
            >
              <img
                :src="item.realFpath"
                :alt="item.fnm"
              >
            </kw-avatar>
            <h3 class="mt20 mb12">
              {{ item.fnm }}
            </h3>

            <ul class="card-text">
              <li>
                <span>
                  {{ item.cralLocaraTno }}- {{ item.mexnoEncr }}- {{ item.cralIdvTno }}
                </span>
              </li>
              <li>
                <span>
                  {{ item.basAdr }}   {{ item.dtlAdr }}
                </span>
              </li>
            </ul>
          </kw-card>
        </div>
      </div>
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        class="pt50"
      />
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal, useDataService, useMeta } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const { modal } = useGlobal();
const { getConfig } = useMeta();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------

let cachedParams;
const cards = ref([]);
const searchParams = ref({
  fnm: '',
});

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchPages() {
  const res = await dataService.get('/sms/wells/competence/business/partner/paging', { params: { ...cachedParams, ...pageInfo.value } });
  const { list: products, pageInfo: pagingResult } = res.data;
  console.log(products);
  cards.value = products;

  pageInfo.value = pagingResult;
}

const onClickSearch = async () => {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await fetchPages();
};

async function onClickPopup() {
  const res = await modal({
    component: 'WwpsfBusinessCardRegP',
    componentProps: { },
  });

  if (res.result) {
    await onClickSearch();
  }
}

async function onClickUpdatePopup(item) {
  const res = await modal({
    component: 'WwpsfBusinessCardModP',
    componentProps: { item },
  });

  if (res.result) {
    await onClickSearch();
  }
}

async function onClickViewPopup(item) {
  const { result, payload } = await modal({
    component: 'WwpsfBusinessCardDtlP',
    componentProps: { item },
  });
  if (result) {
    await onClickSearch();
  }
  if (payload !== undefined) await onClickUpdatePopup(item);
}

onMounted(async () => {
  await onClickSearch();
});
</script>
<style scoped></style>
