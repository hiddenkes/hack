'use strict';

describe('Service: Voicecontrol', function () {

  // load the service's module
  beforeEach(module('hackApp'));

  // instantiate service
  var Voicecontrol;
  beforeEach(inject(function (_Voicecontrol_) {
    Voicecontrol = _Voicecontrol_;
  }));

  it('should do something', function () {
    expect(!!Voicecontrol).toBe(true);
  });

});
