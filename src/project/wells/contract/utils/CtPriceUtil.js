import { warn } from 'vue';

const numberFormat = Intl.NumberFormat('ko-KR');

/**
 * 금액 및 단위를 한국식 금액 표기법에 따라 문자열로 변환합니다.
 * @param {number} numValue
 * @param {string|undefined} [unit = '원']
 * @return {string}
 */
export function getFormattedStr(numValue, unit = '원') {
  return numberFormat.format(numValue) + unit;
}

function getFnlAmt(fnlVal, appliedPromotions = [], sellDscCtrAmt = 0) {
  const minRentalFxam = appliedPromotions
    .reduce(
      (minVal, promotion) => {
        if (!promotion.rentalFxam || Number.isNaN(Number(promotion.rentalFxam))) {
          return minVal;
        }
        return Math.min(minVal, Number(promotion.rentalFxam));
      },
      fnlVal,
    );
  if (minRentalFxam - sellDscCtrAmt < 0) {
    warn('법인 특별 할인가가 프로모션 적용 금액보다 큽니다.');
  }

  return Math.max(minRentalFxam - sellDscCtrAmt, 0);
}

export function getSpayAmt(pdBas, finalPrice, appliedPromotions = [], sellDscCtrAmt = 0) {
  if (!finalPrice || !pdBas) { return; }
  const { rglrSppPrmMcn } = pdBas;
  const { fnlVal, cntrAmt, svVstPrdCd, pcsvPrdCd, bsCycPrdCd, sellTpCd, cntrAmtDscYn } = finalPrice;
  const fnlAmt = getFnlAmt(fnlVal, appliedPromotions, sellDscCtrAmt);

  if (sellTpCd === '1') {
    return fnlAmt;
  }
  if (sellTpCd === '2') {
    return cntrAmtDscYn === 'Y' ? 0 : cntrAmt;
  }
  if (sellTpCd === '3') {
    return 0;
  }
  if (sellTpCd === '6') {
    if (!rglrSppPrmMcn) { // 선납개월이 없는 경우
      return 0;
    }
    if (rglrSppPrmMcn > 0) {
      let spayAmt = fnlAmt * rglrSppPrmMcn;
      let svPrd;
      if (bsCycPrdCd) {
        svPrd = Math.max(bsCycPrdCd, 1);
      } else {
        svPrd = Math.max(Number(svVstPrdCd) || 1, Number(pcsvPrdCd) || 1);
      }
      if (svPrd) {
        spayAmt /= svPrd;
      }
      return spayAmt;
    }
  }
}

export function getSpayAmtByCntrDtl(cntrDtl) {
  if (!cntrDtl) { return undefined; }
  const { fnlAmt, cntrAmt, sellTpCd } = cntrDtl;
  if (sellTpCd === '1') {
    return Number(fnlAmt) || 0;
  }
  if (sellTpCd === '2') {
    return Number(cntrAmt) || 0;
  }
  if (sellTpCd === '3') {
    return 0;
  }
  if (sellTpCd === '6') {
    return Number(cntrAmt) || 0;
  }
}

export function getAftnAmt(finalPrice, appliedPromotions = [], sellDscCtrAmt = 0) {
  if (!finalPrice) { return; }
  const { fnlVal, svVstPrdCd, pcsvPrdCd, bsCycPrdCd, sellTpCd } = finalPrice;
  const fnlAmt = getFnlAmt(fnlVal, appliedPromotions, sellDscCtrAmt);
  if (sellTpCd === '1') {
    return 0;
  }
  if (sellTpCd === '2') {
    return fnlAmt;
  }
  if (sellTpCd === '3') {
    return fnlAmt;
  }
  if (sellTpCd === '6') {
    let aftnAmt = fnlAmt;
    let svPrd;
    if (bsCycPrdCd) {
      svPrd = Math.max(bsCycPrdCd, 1);
    } else {
      svPrd = Math.max(Number(svVstPrdCd) || 1, Number(pcsvPrdCd) || 1);
    }
    if (svPrd) {
      aftnAmt /= svPrd;
    }
    return aftnAmt;
  }
}

export function getAftnAmtByCntrDtl(cntrDtl) {
  if (!cntrDtl) { return undefined; }
  const { fnlAmt, svPrd, sellTpCd } = cntrDtl;
  if (sellTpCd === '1') {
    return 0;
  }
  if (sellTpCd === '2') {
    return fnlAmt;
  }
  if (sellTpCd === '3') {
    return fnlAmt;
  }
  if (sellTpCd === '6') {
    if (!svPrd) {
      warn('정기배송 상품의 BS주기가 없을 수 없습니다.');
      return fnlAmt;
    }
    return fnlAmt / svPrd;
  }
}

export function getDisplayedPrice(finalPrice, sellDscCtrAmt = 0) {
  if (!finalPrice) {
    return '미확정';
  }
  const { fnlVal, svVstPrdCd, pcsvPrdCd, bsCycPrdCd, stplPrdCd, sellTpCd } = finalPrice;
  if (fnlVal !== 0 && !fnlVal) {
    return '미확정';
  }
  const fnlAmt = getFnlAmt(fnlVal, [], sellDscCtrAmt);
  if (sellTpCd === '1') {
    return getFormattedStr(fnlAmt);
  }
  if (sellTpCd === '2') {
    return `${getFormattedStr(fnlAmt)}${stplPrdCd ? ` (${stplPrdCd}개월)` : ''}`;
  }
  if (sellTpCd === '3') {
    return `월 ${getFormattedStr(fnlAmt)}`;
  }
  if (sellTpCd === '6') {
    let svPrd;
    if (bsCycPrdCd) {
      svPrd = Math.max(bsCycPrdCd, 1);
    } else {
      svPrd = Math.max(Number(svVstPrdCd) || 1, Number(pcsvPrdCd) || 1);
    }
    if (svPrd) {
      return `${getFormattedStr(fnlAmt)} (월 ${getFormattedStr(fnlAmt / svPrd)})`;
    }
  }
}

export function getPromotionAppliedPrice(finalPrice, appliedPromotions, sellDscCtrAmt = 0) {
  if (!appliedPromotions?.length) {
    return;
  }
  const { fnlVal } = { ...finalPrice };
  if (!fnlVal) {
    return;
  }
  const pmotAplyFnlVal = getFnlAmt(fnlVal, appliedPromotions, sellDscCtrAmt);
  if (fnlVal === pmotAplyFnlVal) {
    return;
  }
  const promotionApplied = {
    ...finalPrice,
    fnlVal: pmotAplyFnlVal,
  };
  return getDisplayedPrice(promotionApplied);
}

export function getDisplayPriceByCntrDtl(cntrDtl) {
  if (!cntrDtl) { return undefined; }
  const { fnlAmt, svPrd, sellTpCd, stplPtrm } = cntrDtl;
  if (sellTpCd === '1') {
    return getFormattedStr(fnlAmt);
  }
  if (sellTpCd === '2') {
    return `${getFormattedStr(fnlAmt)}${stplPtrm ? ` (${stplPtrm}개월)` : ''}`;
  }
  if (sellTpCd === '3') {
    return `월 ${getFormattedStr(fnlAmt)}`;
  }
  if (sellTpCd === '6') {
    if (svPrd && svPrd > 1) {
      return `${getFormattedStr(fnlAmt)} (월 ${getFormattedStr(fnlAmt / svPrd)})`;
    }
    return `${getFormattedStr(fnlAmt)}`;
  }
}
