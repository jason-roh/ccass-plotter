from utils.api_exceptions import ServiceUnavailable
from functools import wraps
import traceback

def throw_api_error(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as ex:
            raise ServiceUnavailable(
                "Check if HKEx Website is up and running - {}\n\n{}".format(str(ex),
                    ''.join(traceback.format_exception(etype=type(ex), value=ex, tb=ex.__traceback__)))
            )
    return wrapped

def retry(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        num_of_retry = 2
        ex = None
        for _ in range(1, num_of_retry):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                ex = e
        raise ex
    return wrapped
