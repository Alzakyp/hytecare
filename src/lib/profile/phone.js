export function normalizePhone(value){const v=String(value??'').replace(/[\s()-]/g,'');return /^\+?[0-9]{9,16}$/.test(v)?v:null}
export function phoneHref(value){const v=normalizePhone(value);return v?`tel:${v}`:null}
