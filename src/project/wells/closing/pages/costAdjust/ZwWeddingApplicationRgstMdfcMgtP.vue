<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : DCD
2. 프로그램 ID : ZwWeddingApplicationRgstMdfcMgtP - 결혼화환/조화 신청 등록 수정
3. 작성자 : gs.piit172
4. 작성일 : 2023.02.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 결혼화환/조화 신청 등록 수정
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--3xl"
    title="결혼화환/조화 신청"
  >
    <kw-search
      :cols="2"
      @search="onClickSearch"
    >
      <kw-search-row>
        <kw-search-item
          label="번호"
        >
          <kw-input
            icon="search"
            clearable
          />
        </kw-search-item>
        <kw-search-item
          label="성명"
        >
          <kw-input />
        </kw-search-item>
        <kw-search-item
          label="법인구분"
        >
          <kw-input />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="직책">
          <kw-select />
        </kw-search-item>
        <kw-search-item
          label="조직레벨"
          class="w445"
        >
          <kw-select />
          <kw-select />
          <kw-select />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="신청일자">
          <kw-date-picker />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <kw-form class="mt30">
      <kw-form-row>
        <kw-form-item
          label="경조일자"
          required
        >
          <kw-date-picker
            rules="required"
          />
        </kw-form-item>
        <kw-form-item label="경조유형">
          <kw-option-group
            :model-value="'조의'"
            type="radio"
            :options="['조의', '결혼']"
          />
        </kw-form-item>
        <kw-form-item
          label="경조관계"
          required
        >
          <kw-select rules="required" />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          label="경조대상자명"
          required
        >
          <kw-input rules="required" />
        </kw-form-item>
        <kw-form-item
          label="연락처"
          required
        >
          <zwcm-telephone-number rules="required" />
        </kw-form-item>

        <!--  경조유형이 결혼 일 때 비노출 -->
        <kw-form-item
          label="상주명"
          required
        >
          <kw-input rules="required" />
        </kw-form-item>
        <!--  // 경조유형이 결혼 일 때 비노출 -->
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          label="장소명"
          required
        >
          <kw-input rules="required" />
        </kw-form-item>
        <kw-form-item
          :colspan="2"
          label="주소"
          required
        >
          <zwcm-post-code />
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <kw-form-item
          label="첨부파일"
          :colspan="3"
        >
          <zwcm-file-attacher multiple />
        </kw-form-item>
      </kw-form-row>
    </kw-form>
    <template #action>
      <kw-btn
        negative
        label="임시저장"
      />
      <kw-btn
        primary
        label="신청"
      />
    </template>
  </kw-popup>
</template>

<script setup>
import ZwcmTelephoneNumber from '~common/components/ZwcmTelephoneNumber.vue';
import ZwcmFileAttacher from '~common/components/ZwcmFileAttacher.vue';
import ZwcmPostCode from '~common/components/ZwcmPostCode.vue';

async function onClickSearch() {
  console.log('');
}
</script>

<style scoped lang="scss">

</style>
