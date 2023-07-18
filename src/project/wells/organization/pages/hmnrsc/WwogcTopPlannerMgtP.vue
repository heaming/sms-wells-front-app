<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGC
2. 프로그램 ID : WwogcTopPlannerMgtP - 수석 자격조정
3. 작성자 : 김동석
4. 작성일 : 2023-07-06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 수석플래너 관리 화면
****************************************************************************************************
--->
<template>
  <kw-popup
    size="2xl"
  >
    <kw-form :cols="3">
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MGT_YNM')">
          <p>2019-09</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_PARTNER_NO')">
          <p>0000000</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
          <p>이선희</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_UPGR_YM')">
          <p>2019-09</p>
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_DMTN_YM')"
          :colspan="'2'"
        >
          <p>-</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          :label="$t('MSG_TXT_GD')"
        >
          <kw-select
            :model-value="'수석플래너'"
            :options="['수석플래너', '에듀플래너']"
          />
        </kw-form-item>
        <kw-form-item
          :label="$t('MSG_TXT_RFLT_YM')"
          :colspan="'2'"
        >
          <kw-date-picker
            type="month"
          />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_CRT_DT')">
          <p>2023-05-01</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CREATE_NO')">
          <p>0000000</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_CREATE_NM')">
          <p>이선희</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item :label="$t('MSG_TXT_MDFC_DATE')">
          <p>2019-09</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MDFC_USR_NO')">
          <p>0000000</p>
        </kw-form-item>
        <kw-form-item :label="$t('MSG_TXT_MDFC_USR_NM')">
          <p>이선희</p>
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        :label="$t('MSG_BTN_CANCEL')"
      />
      <kw-btn
        :label="$t('MSG_BTN_SAVE')"
        primary
      />
    </template>
  </kw-popup>
</template>
<script setup></script>
<style scoped>
</style>
