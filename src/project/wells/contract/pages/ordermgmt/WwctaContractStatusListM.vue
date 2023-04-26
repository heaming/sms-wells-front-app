<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaContractStatusListM - 계약현황 목록
3. 작성자 : gs.nidhi.d
4. 작성일 : 2023.04.26
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 계약현황 목록
****************************************************************************************************
--->
<template>
  <kw-page>
    <ul class="kw-state-list">
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_DTRM') }}
        </p>
        <p class="kw-state-list__num">
          7<span class="kw-state-list__unit">{{ t('MSG_TXT_NM') }}</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_STLM_FSH') }}
        </p>
        <p class="kw-state-list__num">
          18<span class="kw-state-list__unit">{{ t('MSG_TXT_NM') }}</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_DRFT_CMPL') }}
        </p>
        <p class="kw-state-list__num">
          8<span class="kw-state-list__unit">{{ t('MSG_TXT_NM') }}</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_APP_IN_PRG') }}
        </p>
        <p class="kw-state-list__num">
          7<span class="kw-state-list__unit">{{ t('MSG_TXT_NM') }}</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          {{ t('MSG_TXT_DEL_REQ') }}
        </p>
        <p class="kw-state-list__num">
          7<span class="kw-state-list__unit">{{ t('MSG_TXT_NM') }}</span>
        </p>
      </li>
    </ul>

    <kw-search>
      <kw-search-row>
        <kw-search-item
          :label="$t('MSG_TXT_RCPDT')"
        >
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_CNTR_STAT')">
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item :label="$t('MSG_TXT_PRDT_GUBUN')">
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item :label="$t('MSG_TXT_CNTRT')">
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_PRTNR')">
          <kw-input />
        </kw-search-item>
        <kw-search-item :label="$t('MSG_TXT_VIEW_CLSFCTN')">
          <kw-checkbox
            v-model="checked"
            :label="$t('MSG_TXT_BRNCH_MNGR_CNTRCT')"
            val=""
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            :total-count="156"
          />
        </template>
        <kw-btn
          :label="$t('MSG_TXT_CNTR_MGT')"
          primary
          dense
        />
      </kw-action-top>
      <div class="row q-gutter-sm">
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              {{ t('MSG_TXT_RENTAL') }}
            </p>
            <kw-chip
              :label="$t('MSG_TXT_INDV')"
              color="placeholder"
              outline
            />
          </div>
          <p class="kw-font-subtitle mt20">
            김계약(1983-12-12)
          </p>
          <ul class="card-text my12">
            <li>
              <p class="w90">
                No
              </p>
              <span>
                W2022-1234567
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_RCP_D') }}
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_GOODS_NM') }}
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_PRTNR') }}
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            :label="`${t('MSG_TXT_TEMP_SAVE')}(Step1)`"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              {{ t('MSG_TXT_ISTM') }}
            </p>
            <kw-chip
              :label="$t('MSG_TXT_INDV')"
              color="placeholder"
              outline
            />
          </div>
          <p class="kw-font-subtitle mt20">
            김계약(1983-12-12)
          </p>
          <ul class="card-text my12">
            <li>
              <p class="w90">
                No
              </p>
              <span>
                W2022-1234567
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_RCP_D') }}
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_GOODS_NM') }}
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_PRTNR') }}
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            :label="$t('MSG_TXT_DRFT_CMPL')"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
            />
            <kw-btn
              :label="$t('MSG_TXT_NON_FCF_PYMNT')"
            />
            <kw-btn
              :label="$t('MSG_BTN_CANCEL')"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              {{ t('MSG_TXT_SNGL_PMNT') }}
            </p>
            <kw-chip
              :label="$t('MSG_TXT_INDV')"
              color="placeholder"
              outline
            />
          </div>
          <p class="kw-font-subtitle mt20">
            김계약(1983-12-12)
          </p>
          <ul class="card-text my12">
            <li>
              <p class="w90">
                No
              </p>
              <span>
                W2022-1234567
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_RCP_D') }}
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_GOODS_NM') }}
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_PRTNR') }}
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            :label="$t('MSG_TXT_DTRM')"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
            />
            <kw-btn
              :label="$t('MSG_BTN_F2F_PYMNT')"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              {{ `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_RENTAL')})` }}
            </p>
            <kw-chip
              :label="$t('MSG_TXT_CRP')"
              color="placeholder"
              outline
            />
          </div>
          <p class="kw-font-subtitle mt20">
            김계약(1983-12-12)
          </p>
          <ul class="card-text my12">
            <li>
              <p class="w90">
                No
              </p>
              <span>
                W2022-1234567
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_RCP_D') }}
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_GOODS_NM') }}
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_PRTNR') }}
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            :label="$t('MSG_TXT_DEL_REQ')"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              :label="$t('MSG_BTN_DLT')"
            />
            <kw-btn
              :label="$t('MSG_BTN_DLT_APPRVL')"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              {{ `${t('MSG_TXT_ENVR_ELHM')}(${t('MSG_TXT_PRCHS')})` }}
            </p>
            <kw-chip
              :label="$t('MSG_TXT_INDV')"
              color="placeholder"
              outline
            />
          </div>
          <p class="kw-font-subtitle mt20">
            김계약(1983-12-12)
          </p>
          <ul class="card-text my12">
            <li>
              <p class="w90">
                No
              </p>
              <span>
                W2022-1234567
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_RCP_D') }}
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_GOODS_NM') }}
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_PRTNR') }}
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            :label="$t('MSG_TXT_DRFT_CMPL')"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              :label="$t('MSG_BTN_INQR')"
            />
            <kw-btn
              :label="$t('MSG_TXT_NON_FCF_PYMNT')"
            />
            <kw-btn
              :label="$t('MSG_BTN_CNTCT_ASSGNMNT')"
            />
            <kw-btn
              :label="$t('MSG_TXT_DTRM')"
            />
            <kw-btn
              :label="$t('MSG_BTN_DPST_ABSDR')"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              {{ t('MSG_TXT_SNGL_PMNT') }}
            </p>
            <kw-chip
              :label="$t('MSG_TXT_INDV')"
              color="placeholder"
              outline
            />
          </div>
          <p class="kw-font-subtitle mt20">
            김계약(1983-12-12)
          </p>
          <ul class="card-text my12">
            <li>
              <p class="w90">
                No
              </p>
              <span>
                W2022-1234567
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_RCP_D') }}
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_GOODS_NM') }}
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_DPST_AMT') }}
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                {{ t('MSG_TXT_PRTNR') }}
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            :label="$t('MSG_TXT_DTRM')"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              :label="$t('MSG_BTN_MOD')"
            />
            <kw-btn
              :label="$t('MSG_BTN_F2F_PYMNT')"
            />
            <kw-btn
              :label="$t('MSG_BTN_CNTCT_ASSGNMNT')"
            />
            <kw-btn :label="$t('MSG_BTN_CANCEL')" />
          </div>
        </kw-card>
      </div>
      <kw-pagination
        :model-value="1"
        :total-count="100"
      />
    </div>
  </kw-page>
</template>

<script setup>
const checked = ref('N');
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.kw-card {
  cursor: pointer;

  // min-width: 450px;
  width: calc((100% - 60px) / 3);
}

.state-chip {
  height: 24px;
  border-radius: 10px !important;
  background-color: rgba(47 138 243 / 10%);
  font-size: 14px;
  font-weight: 500;
}

.button-wrap {
  display: flex;
  column-gap: 6px;
  flex-flow: row nowrap;
  white-space: nowrap;

  ::v-deep(.kw-btn) {
    padding: 8px 0;
    flex: 1 1 100%;
    font-size: 14px;
    font-weight: normal;
    letter-spacing: normal;
    color: #555;
    min-height: 40px;
  }
}
</style>
