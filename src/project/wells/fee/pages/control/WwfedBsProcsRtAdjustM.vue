<template>
  <kw-page>
    <template #header>
      <kw-page-header :options="['홈','Depth1','Depth2','BS처리율 조정관리']" />
    </template>
    <kw-search one-row>
      <kw-search-row>
        <kw-search-item
          label="실적년월"
          required
        >
          <kw-date-picker
            rules="required"
            type="month"
          />
        </kw-search-item>
        <kw-search-item
          label="번호 "
          required
        >
          <kw-input
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
            대상자 정보
          </h3>
        </template>

        <kw-btn
          icon="download_on"
          dense
          secondary
          label="엑셀다운로드"
        />
        <kw-separator
          vertical
          inset
          spaced
        />
        <kw-btn
          label="저장"
          dense
          primary
        />
      </kw-action-top>
      <kw-form>
        <kw-form-row>
          <kw-form-item label="성명">
            <p>
              김교원
            </p>
          </kw-form-item>
          <kw-form-item
            label="소속"
            align-content="center"
          >
            <p>Q913123</p>
          </kw-form-item>
          <kw-form-item
            label="직책"
          >
            <p>플래너</p>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <kw-form-item
            label="대상건수"
            align-content="right"
          >
            <p>163</p>
          </kw-form-item>
          <kw-form-item label="적용건수">
            <kw-input />
          </kw-form-item>
          <kw-form-item
            label="처리율 (%)"
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

</script>
