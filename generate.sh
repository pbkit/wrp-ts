rm -rf src/generated
pb gen ts --runtime-package="https://deno.land/x/pbkit@v0.0.45/core/runtime" -o src/generated src/wvrp.proto
