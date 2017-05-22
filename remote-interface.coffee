module.exports = (I, self) ->
  # Embedded package in ZineOS
  if system? and postmaster?
    console.info "Attached ZineOS remote delegate"
    self.invokeRemote = postmaster.invokeRemote
    postmaster.delegate = self
  else if window.location.origin is "null"
    # Assume we're in a secure enough embedded iframe
    console.info "Attached remote interface"
    localPostmaster = require("postmaster")(self)
  else if window is window.parent
    # Not embedded, no need to enable remote interface
    console.info "Not embedded, no remote interface"
  else
    # otherwise we can't allow the remote interface as it could enable XSS
    console.warn "Remote interface disabled, iframe must be sandboxed"

  return self
