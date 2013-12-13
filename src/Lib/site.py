import sys
import external_import
sys.path_hooks.append(external_import.ModuleFinder)
