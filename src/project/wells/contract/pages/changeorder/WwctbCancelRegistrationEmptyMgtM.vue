<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbMembershipCancelRegistrationMgtM - 취소등록 > 멤버쉽 > 4.매출사항/5.취소사항
3. 작성자 : younuk.choi
4. 작성일 : 2023.07.04
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
****************************************************************************************************
--->
<template>
  <kw-list
    separator
    item-padding="20px 0"
  >
    <kw-expansion-item
      padding-target="header"
      expansion-icon-align="center"
      expand-icon-class="kw-font-pt24"
      default-opened
    >
      <template #header>
        <kw-item-section>
          <kw-item-label>
            <span class="text-weight-medium kw-font-pt18">4. {{ t('MSG_TXT_SL_ARTC') }}</span>
          </kw-item-label>
        </kw-item-section>
      </template>
      <div class="pb20" />
    </kw-expansion-item>
  </kw-list>

  <!-- 5. 취소사항 -->
  <kw-action-top
    class="mt30"
  >
    <template #left>
      <h3>5. {{ t('MSG_TXT_CAN_ARTC') }}</h3>
    </template>
    <kw-btn
      :label="$t('MSG_TXT_CAN_ARTC')+' '+$t('MSG_TXT_SRCH')"
      negative
      dense
    />
  </kw-action-top>
  <kw-form
    ref="frmMainMembership"
    cols="3"
  >
    <kw-form-row>
      <!-- row1 요청일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_AK_DT')"
        required
      >
        <kw-date-picker
          v-model="searchDetail.reqDt"
          :label="$t('MSG_TXT_AK_DT')"
          rules="required"
        />
      </kw-form-item>
      <!-- row1 취소일자 -->
      <kw-form-item
        :label="$t('MSG_TXT_CANC_DT')"
        required
      >
        <kw-date-picker />
      </kw-form-item>
    </kw-form-row>
  </kw-form>

  <kw-separator />
  <!-- 6. 취소패키지 취소 위약금/일시불 취소 위약금 조회사항 -->
  <kw-action-top
    class="mt30"
  >
    <template #left>
      <h3>6. 패키지 취소 위약금/일시불 취소 위약금 조회</h3>
    </template>
    <span class="ml8">{{ t('MSG_TXT_UNIT_WON') }}</span>
  </kw-action-top>

  <div class="button-set--bottom">
    <div class="button-set--bottom-right">
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        class="ml8"
      />
      <kw-btn
        :label="$t('MSG_BTN_SAVE')"
        class="ml8"
        primary
      />
    </div>
  </div>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
const { t } = useI18n();

const props = defineProps({
  childDetail: { type: Object, required: true },
});
const searchDetail = reactive(props.childDetail);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>

<style scoped lang="scss">
.kw-form-row + .kw-separator {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
