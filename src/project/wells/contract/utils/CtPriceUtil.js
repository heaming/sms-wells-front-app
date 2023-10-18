import { getNumberWithComma } from '~sms-common/contract/util';

export function getSpayAmt(pdBas, finalPrice) {
  const { rglrSppPrmMcn } = pdBas;
  const { fnlVal, cntrAmt, svVstPrdCd, pcsvPrdCd, sellTpCd } = finalPrice;
  if (sellTpCd === '1') {
    return fnlVal;
  }
  if (sellTpCd === '2') {
    return cntrAmt;
  }
  if (sellTpCd === '3') {
    return 0;
  }
  if (sellTpCd === '6') {
    if (!rglrSppPrmMcn) { // 선납개월이 없는 경우
      return 0;
    }
    if (rglrSppPrmMcn > 0) {
      let spayAmt = fnlVal * rglrSppPrmMcn;
      const svPrd = Math.max(Number(svVstPrdCd) || 0, Number(pcsvPrdCd) || 0);
      if (svPrd) {
        spayAmt /= svPrd;
      }
      return spayAmt;
    }
  }
}

export function getSpayAmtByCntrDtl(cntrDtl) {
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

export function getAftnAmt(finalPrice) {
  const { fnlVal, svVstPrdCd, pcsvPrdCd, sellTpCd } = finalPrice;
  if (sellTpCd === '1') {
    return 0;
  }
  if (sellTpCd === '2') {
    return fnlVal;
  }
  if (sellTpCd === '3') {
    return fnlVal;
  }
  if (sellTpCd === '6') {
    let aftnAmt = fnlVal;
    const svPrd = Math.max(Number(svVstPrdCd) || 0, Number(pcsvPrdCd) || 0);
    if (svPrd) {
      aftnAmt /= svPrd;
    }
    return aftnAmt;
  }
}

export function getAftnAmtByCntrDtl(cntrDtl) {
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
    return fnlAmt / svPrd;
  }
}

export function getDisplayedPrice(finalPrice) {
  if (!finalPrice) {
    return '미확정';
  }
  const { fnlVal, svVstPrdCd, pcsvPrdCd, stplPrdCd, sellTpCd } = finalPrice;
  if (!fnlVal) {
    return '미확정';
  }
  if (sellTpCd === '1') {
    return `${getNumberWithComma(fnlVal)}원`;
  }
  if (sellTpCd === '2') {
    return `${getNumberWithComma(fnlVal)}원${stplPrdCd ? ` (${stplPrdCd}개월)` : ''}`;
  }
  if (sellTpCd === '3') {
    return `월${getNumberWithComma(fnlVal)}원`;
  }
  if (sellTpCd === '6') {
    const svPrd = Math.max(Number(svVstPrdCd) || 0, Number(pcsvPrdCd) || 0);
    if (svPrd) {
      return `${getNumberWithComma(fnlVal)}원 (월 ${getNumberWithComma(fnlVal
        / svPrd)}원)`;
    }
  }
}

export function getPromotionAppliedPrice(finalPrice, appliedPromotions) {
  if (!appliedPromotions?.length) {
    return;
  }
  const fnlVal = finalPrice?.fnlVal;
  if (!fnlVal) {
    return;
  }
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
  const pmotAplyPrice = Math.max(minRentalFxam, 0);
  if (fnlVal === pmotAplyPrice) {
    return;
  }
  const promotionApplied = {
    ...finalPrice,
    fnlVal: pmotAplyPrice,
  };
  return getDisplayedPrice(promotionApplied);
}

export function getDisplayPriceByCntrDtl(cntrDtl) {
  const { fnlAmt, svPrd, sellTpCd, stplPtrm } = cntrDtl;
  if (sellTpCd === '1') {
    return `${getNumberWithComma(fnlAmt)}원`;
  }
  if (sellTpCd === '2') {
    return `${getNumberWithComma(fnlAmt)}원${stplPtrm ? ` (${stplPtrm}개월)` : ''}`;
  }
  if (sellTpCd === '3') {
    return `월${getNumberWithComma(fnlAmt)}원`;
  }
  if (sellTpCd === '6') {
    if (svPrd && svPrd > 1) {
      return `${getNumberWithComma(fnlAmt)}원 (월 ${getNumberWithComma(fnlAmt / svPrd)}원)`;
    }
    return `${getNumberWithComma(fnlAmt)}원`;
  }
}
