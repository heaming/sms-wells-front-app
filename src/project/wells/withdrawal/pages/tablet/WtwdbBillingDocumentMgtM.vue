<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : idvrve
2. 프로그램 ID : WtwdbBillingDocumentTabletMgtM  - 청구서 관리 태블릿
3. 작성자 : heungjun.lee
4. 작성일 : 2023.02.07
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
      <!-- label="청구서 작성" -->
      <kw-btn
        :label="t('MSG_BTN_BILDC_WRTE')"
        borderless
        @click="onClickRegP"
      />
    </template>
    <!-- one-row -->
    <kw-search
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item>
          <!-- required -->
          <!-- rules="required" -->
          <!-- label="고객명"             -->
          <kw-input
            v-model="searchParams.cstFnm"
            :label="t('MSG_TXT_CST_NM')"
            icon="search"
            rules="required|max:16"
            @click-icon="onClickSearchUser"
          />
        </kw-search-item>
        <kw-search-item>
          <kw-date-picker
            v-model="searchParams.bildcWrteDt"
            :label="t('MSG_TIT_DRAT_DT')"
          />
          <!-- label="작성일" -->
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area pt40">
      <kw-action-top class="mt0">
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
          @click="onClickedit"
        />
      </kw-action-top>
      <kw-separator
        v-if="!isEditChk"
        color="black1"
        spaced="0"
      />
      <kw-list
        v-model:selected="arrModel"
        :items="items"
        separator
        :checkbox="isEditChk"
        item-padding="16px 0"
        :clickable="true"
      >
        <!-- @click-item="onClickModify" -->
        <!-- :clickable="!isEditChk" -->
        <template #item="{ item }">
          <kw-item-section>
            <kw-form
              dense
            >
              <kw-form
                dense
              >
                <kw-form-row>
                  <!-- label="고객명" -->
                  <kw-form-item
                    :label="t('MSG_TXT_CST_NM')"
                  >
                    <p>{{ item.cstFnm }}</p>
                  </kw-form-item>
                  <!-- label="작성일자" -->
                  <kw-form-item
                    :label="t('MSG_TXT_WRTE_DT')"
                  >
                    <p>{{ item.bildcWrteDt }}</p>
                  </kw-form-item>
                  <!-- label="발송일자" -->
                  <kw-form-item
                    :label="t('MSG_TXT_FW_DT')"
                  >
                    <p>{{ item.bildcFwDtm }}</p>
                  </kw-form-item>
                </kw-form-row>
                <kw-form-row>
                  <!-- label="상품명" -->
                  <kw-form-item
                    :label="t('MSG_TXT_PRDT_NM')"
                  >
                    <p>{{ item.pdNm }}</p>
                  </kw-form-item>
                  <!-- label="총수량" -->
                  <kw-form-item
                    :label="t('MSG_TXT_TOT_QTY')"
                  >
                    <p>{{ item.pdQtySum }}</p>
                  </kw-form-item>
                  <!-- label="총금액" -->
                  <kw-form-item
                    :label="t('MSG_TXT_TOT_AMT')"
                  >
                    <p>{{ stringUtil.getNumberWithComma(toInteger(item.pdSellAmtSum)) }}</p>
                  </kw-form-item>
                </kw-form-row>
              </kw-form>
            </kw-form>
          </kw-item-section>
          <kw-item-section
            side
            top
          >
            <kw-btn
              label="청구서 발송"
              secondary
              dense
              @click="onClickMove(item)"
            />
          </kw-item-section>
        </template>
      </kw-list>
    </div>

    <template #action>
      <div class="tablet-action-left">
        <kw-btn
          v-if="isEditChk"
          secondary
          :label="t('MSG_BTN_CANCEL')"
          @click="onClickCencel"
        />
        <!-- label="취소" -->
      </div>
      <div class="tablet-action-right">
        <kw-btn
          v-if="isEditChk"
          primary
          :label="`${checkCount}`+t('MSG_BTN_DEL')"
          @click="onClickRemove"
        />
        <!-- label="삭제" -->
      </div>
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------

import dayjs from 'dayjs';
import { codeUtil, modal, useDataService, stringUtil, confirm } from 'kw-lib';
import { cloneDeep, isUndefined, toInteger } from 'lodash-es';

const dataService = useDataService();
const now = dayjs();
const router = useRouter();
const { t } = useI18n();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
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

const pageRef = ref();

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
  if (items.value.length >= pagingResult.totalCount) {
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

// 고객명 찾기 이벤트
async function onClickSearchUser() {
  const { result, payload } = await modal({ component: 'ZwcsaCustomerListP' });

  if (result) {
    searchParams.value.cstFnm = payload.name;
  }
}

// 청구서 작성
async function onClickRegP() {
  router.replace(
    {
      path: '/withdrawal/wtwdb-billing-document-write-reg',
      query: {
        searchCstFnm: searchParams.value.cstFnm, // 조회조건
        searchBildcWrteDt: searchParams.value.bildcWrteDt, // 조회조건
      },
    },
  );
}

// 청구서 작성
// async function onClickModify(data) {
//   const modifyRows = cloneDeep(data.value);
//   router.replace(
//     {
//       path: '/ns/wtwdb-billing-document-write-reg',
//       query: {
//         bildcPblNo: modifyRows.bildcPblNo,
//         cstFnm: modifyRows.cstFnm,
//         bildcWrteDt: dayjs(modifyRows.bildcWrteDt).format('YYYYMMDD'),
//         bildcPblSn: modifyRows.bildcPblSn,
//         sellPrtnrNo: modifyRows.sellPrtnrNo,
//         sellPrtnrNm: modifyRows.sellPrtnrNm,
//         searchCstFnm: searchParams.value.cstFnm, // 조회조건
//         searchBildcWrteDt: searchParams.value.bildcWrteDt, // 조회조건
//       },
//       params: { a: 'b' },
//     },
//   );
// }

// 청구서발송
async function onClickMove(data) {
  router.replace(
    {
      path: '/withdrawal/wtwdb-billing-document-fw-reg',
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

  // deleteCount.value = deleteData.length
  if (deletedRows.length > 0) {
    await dataService.delete('/sms/wells/withdrawal/idvrve/billing-document-orders', { data: deletedRows });
    await onClickSearch();
  }
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
