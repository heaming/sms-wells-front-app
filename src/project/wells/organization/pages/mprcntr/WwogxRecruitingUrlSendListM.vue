<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGB
2. 프로그램 ID : WwogxRecruitingUrlSendListM - 리쿠르팅 등록 URL발송
3. 작성자 : 한용희
4. 작성일 : 2023-03-10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 리쿠르팅 등록 URL발송
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search :cols="0">
      <kw-search-item>
        <kw-date-range-picker
          grow
          :label="$t('MSG_TXT_WRTE_DT', undefined, '작성일자')"
          class="mb20"
        />
      </kw-search-item>
      <kw-search-item>
        <kw-date-range-picker
          grow
          :label="$t('MSG_TXT_RCRT_DT', undefined, '리쿠르팅일자')"
          class="mb20"
        />
      </kw-search-item>
      <kw-search-item>
        <kw-option-group
          :label="$t('MSG_TXT_ITEM_NM', undefined, '항목명')"
          :model-value="'승인건'"
          type="radio"
          :options="['승인건', '리쿠르팅건']"
          class="mb20"
        />
      </kw-search-item>
      <kw-search-item>
        <kw-input
          :label="$t('MSG_TXT_EMPL_NM', undefined, '성명')"
        />
      </kw-search-item>
    </kw-search>
    <kw-separator
      divider
    />
    <div class="pa20">
      <kw-action-top class="mb12 kw-font-pt14">
        <template #left>
          <kw-paging-info :total-count="3" />
        </template>
      </kw-action-top>
      <kw-separator
        divider
        :spaced="`false`"
        size="1px"
        class="kw-bc--black1 mb20"
      />

      <kw-list
        :items="items"
        clickable
        item-key="id"
      >
        <template #item="{ item }">
          <kw-item-section class="border-box pa16 mb12">
            <kw-form dense>
              <div class="row justify-between items-center">
                <p class="pt0 mb12">
                  {{ item.heading }}
                </p>
                <kw-chip
                  outline
                  class="mt2"
                  :class="item.chiptext == '재등록' ? 'kw-fc--placeholder' : 'kw-fc--primary'"
                >
                  {{ item.chiptext }}
                </kw-chip>
              </div>

              <h4 class="pt0 mb12">
                {{ item.productkey }}
              </h4>
              <p>{{ item.text1 }}</p>
              <p>{{ item.text2 }}</p>
              <p>{{ item.text3 }}</p>
              <kw-separator
                divider
                :spaced="`false`"
                size="1px"
                class="mb12 mt12"
              />
              <p class="pt0">
                {{ item.heading2 }}
              </p>
              <kw-form-item :label="$t('MSG_TIT_DRAT_DT', undefined, '작성일')">
                <p>{{ item.valuetext1 }}</p>
              </kw-form-item>
              <kw-form-item :label="$t('MSG_TXT_CNTRCT_DT', undefined, '계약일')">
                <p>{{ item.valuetext2 }}</p>
              </kw-form-item>
            </kw-form>
          </kw-item-section>
        </template>
      </kw-list>
    </div>

    <template #action>
      <kw-btn
        filled
        primary
        :label="$t('MSG_TIT_RCRT_RGST_URL_FW')"
        @click="onClickUrlSend"
      />
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal } from 'kw-lib';

const { modal, notify } = useGlobal();
const { t } = useI18n();

const items = ref([
  { id: '1', heading: '최종확정', productkey: '김교원(1234567)', chiptext: '재등록', text1: '강남센터 B010160', text2: '20221224 - 2******', text3: '010-9000-8000', heading2: '김발송(1234567)', valuetext1: '2022-08-15', valuetext2: '2022-08-15' },
  { id: '2', heading: '임시저장', productkey: '김교원(1234567)', chiptext: '신규', text1: '강남센터 B010160', text2: '20221224 - 2******', text3: '010-9000-8000', heading2: '김발송(1234567)', valuetext1: '2022-08-15', valuetext2: '2022-08-15' },
  { id: '3', heading: '임시저장', productkey: '김교원(1234567)', chiptext: '신규', text1: '강남센터 B010160', text2: '20221224 - 2******', text3: '010-9000-8000', heading2: '김발송(1234567)', valuetext1: '2022-08-15', valuetext2: '2022-08-15' },

]);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 리쿠르팅 등록 URL 발송
async function onClickUrlSend() {
  const { result: isChanged } = await modal({
    component: 'WwogxRecruitingUrlSendRegP',
    componentProps: { undefined },
  });

  if (isChanged) {
    notify(t('MSG_ALT_SEND'));
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>

<style scoped lang="scss">
p {
  font-size: 14px;
}

</style>
