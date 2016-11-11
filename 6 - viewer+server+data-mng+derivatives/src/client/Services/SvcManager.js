
class SvcManager {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    this._services = {}
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  registerService(svc) {

    this._services[svc.name()] = svc
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getService(name) {

    if(this._services[name]){

      return this._services[name]
    }

    return null
  }
}

var TheSvcManager = new SvcManager()

export default TheSvcManager