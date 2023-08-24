<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfBusinessCardDtlP - 명함첩관리 - 명함상세보기
3. 작성자 : jisung you
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-명함첩관리-명함상세보기
****************************************************************************************************
--->
<template>
  <kw-popup
    size="md"
  >
    <div class="row mb20">
      <div
        class="text-center"
        style="width: 100%;"
      >
        <!-- style 부분은 개발 시 조정 -->
        <kw-avatar
          font-size="18px"
          color="line-bg"
          square
          style="width: 100%; height: 290px;"
        >
          <img
            :src="item.realFpath"
            :alt="item.fnm"
          >
        </kw-avatar>
      </div>
    </div>
    <kw-form
      :cols="1"
      dense
    >
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_EMPL_NM')"
        >
          <p> {{ item.fnm }} </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_CONTACT')"
        >
          <p>
            {{ item.cralLocaraTno }}- {{ item.mexnoEncr }}- {{ item.cralIdvTno }}
          </p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_ADDR')"
        >
          <p>    {{ item.basAdr }}   {{ item.dtlAdr }}</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_DEL')"
        @click="onClickDelete"
      />
      <kw-btn
        primary
        :label="$t('MSG_BTN_MOD')"
        @click="onClickCancel"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useGlobal, useModal } from 'kw-lib';

const { t } = useI18n();
const { ok } = useModal();
const { confirm } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  item: { type: Array, default: () => [] },
});

const item = ref(props.item);

async function onClickDelete() {
  if (await confirm(t('MSG_ALT_WANT_DEL_WCC'))) {
    const { ctplcSn } = props.item;
    await dataService.delete(`/sms/wells/competence/business/partner/${ctplcSn}`);
    ok();
  }
}
function onClickCancel() {
  const payload = { mode: 'update' };
  ok(payload);
}

</script>
<style scoped></style>
