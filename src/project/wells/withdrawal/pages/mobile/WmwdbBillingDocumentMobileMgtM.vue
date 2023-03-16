<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : mobile
2. 프로그램 ID : WmwdbBillingDocumentMobileMgtM - 청구서 관리 모바일
3. 작성자 : sojeong.Shin
4. 작성일 : 2023.03.16
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-- 청구서 관리 조회
****************************************************************************************************
--->
<template>
  <kw-page
    ref="pageRef"
    @load="onLoad"
  >
    <template #etc>
      <kw-btn
        :label="t('MSG_BTN_BILDC_WRTE')"
        borderless
        @click="onClickRegP"
      />
    </template>
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <!-- label="고객명" -->
      <kw-input
        v-model="searchParams.cstFnm"
        :label="t('MSG_TXT_CST_NM')"
        icon="search"
        rules="required|max:16"
        maxlength="48"
        clearable
        @click-icon="onClickSearchUser"
      />

      <!-- label="작성일" -->
      <kw-date-picker
        v-model="searchParams.bildcWrteDt"
        :label="t('MSG_TIT_DRAT_DT')"
        class="pt20"
      />
    </kw-search>
    <kw-separator
      divider
    />
    <div class="px20 pt20">
      <kw-action-top class="mb12">
        <template #left>
          <kw-paging-info
            v-if="!isEditChk"
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
          />
        </template>

        <!-- label="편집" -->
        <kw-btn
          v-if="!isEditChk"
          :label="t('MSG_BTN_EDIT')"
          secondary
          dense
          border-color="line-stroke"
          @click="onClickedit"
        />
      </kw-action-top>
      <kw-separator
        v-if="!isEditChk"
        divider
        :spaced="`false`"
        size="1px"
        color="black1"
      />

      <kw-list
        ref="mlist"
        v-model:selected="arrModel"
        :items="items"
        item-padding
        separator
        :checkbox="isEditChk"
        :clickable="true"
      >
        <!-- item-key="id"  -->
        <template #item="{ item }">
          <kw-item-section>
            <kw-form
              dense
              cols="2"
            >
              <!-- label="고객명" -->
              <kw-form-item :label="t('MSG_TXT_CST_NM')">
                <p>{{ item.cstFnm }}</p>
              </kw-form-item>

              <!-- label="작성일자" -->
              <kw-form-item :label="t('MSG_TXT_WRTE_DT')">
                <p>{{ item.bildcWrteDt }}</p>
              </kw-form-item>

              <!-- label="발송일자" -->
              <kw-form-item :label="t('MSG_TXT_FW_DT')">
                <p>{{ item.bildcFwDtm }}</p>
              </kw-form-item>

              <!-- label="상품명" -->
              <kw-form-item :label="t('MSG_TXT_PRDT_NM')">
                <p>{{ item.pdNm }}</p>
              </kw-form-item>

              <!-- label="총수량" -->
              <kw-form-item :label="t('MSG_TXT_TOT_QTY')">
                <p>{{ item.pdQtySum }}</p>
              </kw-form-item>

              <!-- label="총금액(원)" -->
              <kw-form-item :label="t('MSG_TXT_TOT_AMT')">
                <p>{{ stringUtil.getNumberWithComma(toInteger(item.pdSellAmtSum)) }}</p>
              </kw-form-item>

              <!-- label="청구서 발송" -->
              <kw-btn
                secondary
                :label="t('MSG_TXT_BILDC_FW')"
                class="full-width mt12"
                border-color="line-stroke"
                dense
                @click="onClickMove(item)"
              />
            </kw-form>
          </kw-item-section>
        </template>
      </kw-list>
    </div>

    <template #action>
      <kw-btn
        v-if="isEditChk"
        filled
        negative
        :label="t('MSG_BTN_CANCEL')"
        @click="onClickCencel"
      />
      <kw-btn
        v-if="isEditChk"
        filled
        primary
        :label="`${checkCount}`+t('MSG_BTN_DEL')"
        @click="onClickRemove"
      />
    </template>
  </kw-page>
</template>

<script setup>

import dayjs from 'dayjs';
import { codeUtil, modal, router, useDataService, stringUtil, confirm, notify } from 'kw-lib';
import { cloneDeep, isUndefined, toInteger } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const pageRef = ref();

const props = defineProps({
  searchCstFnm: {
    type: String,
    default: null,
  },
  searchBildcWrteDt: {
    type: String,
    default: null,
  },
});

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const { t } = useI18n();

const items = ref([]);

const isEditChk = ref(false);

const arrModel = ref([]);

const checkCount = ref([]);

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(codes.COD_PAGE_SIZE_OPTIONS[0].codeName),
  needTotalCount: true,
});

const searchParams = ref({
  cstFnm: '',
  bildcWrteDt: now.format('YYYYMMDD'),
});

let cachedParams;

watch(() => arrModel.value.length, (newVal) => {
  if (newVal === 0 || isUndefined(newVal)) {
    checkCount.value = [];
  } else {
    checkCount.value = t('MSG_TXT_TASKS_CNT', [newVal]);
  }
});

async function onLoad(pageIdx) {
  pageInfo.value.pageIndex = pageIdx;
  cachedParams = { ...cachedParams, ...pageInfo.value };

  const res = await dataService.get('/sms/wells/withdrawal/idvrve/billing-document-orders/paging', { params: cachedParams });
  const { list: pages, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  pages.forEach((data) => {
    if (data.bildcWrteDt) {
      data.bildcWrteDt = dayjs(data.fstRgstDtm).format('YYYY-MM-DD');
    }

    if (data.bildcFwDtm) {
      data.bildcFwDtm = dayjs(data.bildcFwDtm).format('YYYY-MM-DD');
    }
  });

  items.value.push(...pages);

  // 가져온 데이터가 가져와야할 pageSize보다 작으면 마지막 페이지이다.
  if (pages.length < pagingResult.pageSize) {
    await pageRef.value.stopLoad();
  } else {
    await pageRef.value.startLoad();
  }
}

async function onClickSearch() {
  items.value = [];
  arrModel.value = [];

  pageInfo.value.pageIndex = 1;

  cachedParams = cloneDeep(searchParams.value);

  await onLoad();
}

// 고객명 찾기 이벤트 --modal 아닌 router로 변경해야함
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP' });

  if (result) {
    searchParams.value.cstFnm = payload.name;
  }
}

// 청구서 작성 -- ns 경로 변경 필요
async function onClickRegP() {
  await router.push(
    {
      path: '/ns/wmwdb-billing-document-write-mobile-reg',
      query: {
        searchCstFnm: searchParams.value.cstFnm, // 조회조건
        searchBildcWrteDt: searchParams.value.bildcWrteDt, // 조회조건
      },
    },
  );
}

// 청구서 발송
async function onClickMove(data) {
  router.replace(
    {
      path: '/ns/wmwdb-billing-document-fw-mbl-reg',
      query: {
        searchCstFnm: searchParams.value.cstFnm, // 조회조건
        searchBildcWrteDt: searchParams.value.bildcWrteDt, // 조회조건
        bildcPblNo: data.bildcPblNo,
        cstFnm: data.cstFnm,
        pdNm: data.pdNm,
        pdQtySum: data.pdQtySum,
        pdSellAmtSum: data.pdSellAmtSum,
      },
    },
  );
}

// 편집 클릭
async function onClickedit() {
  isEditChk.value = !isEditChk.value;
}

// 취소 버튼
async function onClickCencel() {
  isEditChk.value = !isEditChk.value;
}

// 삭제 버튼
async function onClickRemove() {
  if (!await confirm(t('MSG_ALT_WANT_DEL'))) { return; }

  const deletedRows = cloneDeep(arrModel.value);

  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/withdrawal/idvrve/billing-document-orders', { data: deletedRows });
    await onClickSearch();
  }

  notify(t('MSG_ALT_DELETED'));
}

async function initProps() {
  if (props.searchCstFnm || props.searchBildcWrteDt) {
    const { searchCstFnm, searchBildcWrteDt } = props;
    searchParams.value.cstFnm = searchCstFnm;
    searchParams.value.bildcWrteDt = searchBildcWrteDt;
  }
  await onClickSearch();
}

onMounted(async () => {
  await initProps();
});

</script>

<style scoped lang="scss">

</style>
