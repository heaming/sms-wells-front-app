<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : FEB
2. 프로그램 ID : WwfedBsProcsRtAdjustM - BS처리율 조정관리
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- BS처리율 조정관리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search one-row>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_PERF_YM')"
          required
        >
          <kw-date-picker
            rules="required"
            :label="$t('MSG_TXT_PERF_YM')"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
          required
        >
          <kw-input
            :label="$t('MSG_TXT_SEQUENCE_NUMBER')"
            icon="search"
            clearable
            rules="required"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="result-area">
      <kw-action-top class="mb20">
        <template #left>
          <h3 class="kw-font-pt18">
            {{ t('MSG_TXT_TRGT_INFO') }}
          </h3>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          :label="$t('MSG_TXT_EXCEL_DOWNLOAD')"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          :label="$t('MSG_BTN_SAVE')"
          dense
          primary
        />
      </kw-action-top>
      <kw-form>
        <kw-form-row>
          <kw-form-item :label="$t('MSG_TXT_EMPL_NM')">
            <p>김교원</p>
          </kw-form-item>
          <kw-form-item
            :label="$t('MSG_TXT_BLG')"
            align-content="center"
          >
            <p>Q913123</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_RSB')">
            <p>플래너</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            :label="$t('MSG_TXT_OJ_CT')"
            align-content="right"
          >
            <p>163</p>
          </kw-form-item>
          <kw-form-item :label="$t('MSG_TXT_APPLCTN_NO')">
            <kw-input />
          </kw-form-item>
          <kw-form-item
            :label="`${t('MSG_TXT_PROCS_RT')}(%)`"
            align-content="right"
          >
            <p>91.41</p>
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
const { t } = useI18n();
</script>
