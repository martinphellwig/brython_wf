"""Access to Python's configuration information."""

#well emulate this module since it does with settings very close to the
#OS and metal

variables={'TANH_PRESERVES_ZERO_SIGN': 0}

def get_config_var(variable):
    if variable in variables:
       return variables['TANH_PRESERVES_ZERO_SIGN']

    raise NotImplementedError("sysconfig.py:get_config_var: variable '%s' does not exist" % variable)
