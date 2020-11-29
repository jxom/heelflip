<script>
  export let fn;
  export let defer;

  const STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  }

  let initialState = defer ? STATES.IDLE : STATES.LOADING;
  let initialRecord = {
    response: undefined,
    error: undefined,
    state: initialState,
    isIdle: defer,
    isLoading: !defer,
    isSuccess: false,
    isError: false,
  };
  let record = initialRecord;

  function handleLoading() {
    if (record.state !== STATES.LOADING) {
      record = { ...record, state: STATES.LOADING, isIdle: false, isLoading: true, isSuccess: false, isError: false };
    }
  }

  function handleSuccess({ response }) {
    record = { response, state: STATES.SUCCESS, isIdle: false, isLoading: false, isSuccess: true, isError: false };
  }

  function handleError({ error }) {
    record = { error, state: STATES.ERROR, isIdle: false, isLoading: false, isSuccess: false, isError: true };
  }

  function invoke() {
    handleLoading();
    fn()
      .then((response) => handleSuccess({ response }))
      .catch((error) => handleError({ error }));
  }

  if (!defer) {
    invoke();
  }
</script>

<slot {record} {invoke} />
