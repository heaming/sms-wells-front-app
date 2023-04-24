<template>
  <kw-page>
    <template #header>
      <kw-page-header
        :options="['홈','판매관리','계약관리','계약현황목록']"
      />
    </template>

    <ul class="kw-state-list">
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          확정
        </p>
        <p class="kw-state-list__num">
          7<span class="kw-state-list__unit">명</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          결제완료
        </p>
        <p class="kw-state-list__num">
          18<span class="kw-state-list__unit">명</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          작성완료
        </p>
        <p class="kw-state-list__num">
          8<span class="kw-state-list__unit">명</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          결제중
        </p>
        <p class="kw-state-list__num">
          7<span class="kw-state-list__unit">명</span>
        </p>
      </li>
      <li class="kw-state-list__item">
        <p class="kw-state-list__top">
          삭제요청
        </p>
        <p class="kw-state-list__num">
          7<span class="kw-state-list__unit">명</span>
        </p>
      </li>
    </ul>

    <kw-search>
      <kw-search-row>
        <kw-search-item
          label="접수일자"
        >
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>

        <kw-search-item label="계약상태">
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>

        <kw-search-item label="상품구분">
          <kw-select
            :model-value="['']"
            :options="['전체','B','C']"
          />
        </kw-search-item>
      </kw-search-row>

      <kw-search-row>
        <kw-search-item label="계약자">
          <kw-input />
        </kw-search-item>
        <kw-search-item label="파트너">
          <kw-input />
        </kw-search-item>
        <kw-search-item label="보기 구분">
          <kw-checkbox
            v-model="checked"
            label="지점장 계약건만 보기"
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
          label="계약관리"
          primary
          dense
        />
      </kw-action-top>
      <div class="row q-gutter-sm">
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              렌탈
            </p>
            <kw-chip
              label="개인"
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
                접수일
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                제품명
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                입금대상금액
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                파트너
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            label="임시저장(Step1)"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              label="수정"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              할부
            </p>
            <kw-chip
              label="개인"
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
                접수일
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                제품명
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                입금대상금액
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                파트너
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            label="작성완료"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              label="수정"
            />
            <kw-btn
              label="비대면결제"
            />
            <kw-btn
              label="취소"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              일시불
            </p>
            <kw-chip
              label="개인"
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
                접수일
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                제품명
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                입금대상금액
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                파트너
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            label="확정"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              label="조회"
            />
            <kw-btn
              label="대면결제"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              환경가전(렌탈)
            </p>
            <kw-chip
              label="법인"
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
                접수일
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                제품명
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                입금대상금액
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                파트너
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            label="삭제요청"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              label="삭제반려"
            />
            <kw-btn
              label="삭제승인"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              환경가전(구매)
            </p>
            <kw-chip
              label="개인"
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
                접수일
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                제품명
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                입금대상금액
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                파트너
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            label="작성완료"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              label="조회"
            />
            <kw-btn
              label="비대면결제"
            />
            <kw-btn
              label="컨택배정"
            />
            <kw-btn
              label="확정"
            />
            <kw-btn
              label="입금대사"
            />
          </div>
        </kw-card>
        <kw-card>
          <div class="row items-center justify-between">
            <p class="kw-font-pt14 kw-fc--black2">
              일시불
            </p>
            <kw-chip
              label="개인"
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
                접수일
              </p>
              <span>
                2022-12-12
              </span>
            </li>
            <li>
              <p class="w90">
                제품명
              </p>
              <span>
                비데(BM551RWA)
              </span>
            </li>
            <li>
              <p class="w90">
                입금대상금액
              </p>
              <span class="text-weight-bold">
                300,000원
              </span>
            </li>
            <li>
              <p class="w90">
                파트너
              </p>
              <span>
                김판매
              </span>
            </li>
          </ul>
          <kw-chip
            class="state-chip"
            label="확정"
          />
          <kw-separator spaced="20px" />
          <div class="button-wrap">
            <kw-btn
              label="수정"
            />
            <kw-btn
              label="대면결제"
            />
            <kw-btn
              label="컨택배정"
            />
            <kw-btn label="취소" />
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
