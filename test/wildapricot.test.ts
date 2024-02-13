import { it, describe } from 'node:test';
import assert from 'node:assert/strict';

import { addSeconds } from "date-fns";
import { isAuthExpired } from "../src/wildapricot";

describe('isAuthExpired', () => {
  it('should return true if the token is expired', () => {
    const aMinuteAgo = addSeconds(new Date(), -60);

    assert.equal(isAuthExpired(aMinuteAgo), true);
  });

  it('should return false if the token is not expired', () => {
    const aMinuteFromNow = addSeconds(new Date(), 60);

    assert.equal(isAuthExpired(aMinuteFromNow), false);
  });

  it('should return true if the token is unset', () => {
    assert.equal(isAuthExpired(undefined), true);
  });
});

