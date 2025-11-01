<template>
  <div
    class="container-fluid h-100 d-flex justify-content-center align-items-center"
    style="min-height: 100vh"
  >
    <div class="row w-100">
      <div class="col-sm-0 col-md-2 col-lg-2 col-xl-4 col-xxl-4"></div>
      <div class="col-sm-12 col-md-8 col-lg-8 col-xl-4 col-xxl-4">
        <div class="frosted w-100 p-5 rounded-3 position-relative text-center">
          <div class="mb-3 text-center">
            <RouterLink to="/">
              <div class="mb-2">
                <img
                  style="width: 30%"
                  src="@/assets/images/logo.png"
                  class="rounded-4"
                  alt=""
                />
              </div>
            </RouterLink>
          </div>
          <slot> </slot>
        </div>
      </div>
      <div class="col-sm-0 col-md-2 col-lg-2 col-xl-4 col-xxl-4"></div>
    </div>
  </div>
</template>
