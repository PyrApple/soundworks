/**
 * The default view templates for the services and scenes. The view templates are organized according to the `Module.name` property.
 *
 * These view template are internally parsed using `lodash.template`, see [https://lodash.com/docs#template](https://lodash.com/docs#template) for more information.
 *
 * @type {Object}
 */
const defaultViewTemplates = {
  'service:checkin': `
    <% if (label) { %>
      <div class="section-top flex-middle">
        <p class="big"><%= labelPrefix %></p>
      </div>
      <div class="section-center flex-center">
        <div class="checkin-label">
          <p class="huge bold"><%= label %></p></div>
      </div>
      <div class="section-bottom flex-middle">
        <p class="small"><%= labelPostfix %></p>
      </div>
    <% } else { %>
      <div class="section-top"></div>
      <div class="section-center flex-center">
        <p><%= error ? errorMessage : wait %></p>
      </div>
      <div class="section-bottom"></div>
    <% } %>
  `,

  'service:control': `
    <h1 class="big"><%= title %></h1>
  `,

  'service:loader': `
    <div class="section-top flex-middle">
      <p><%= loading %></p>
    </div>
    <div class="section-center flex-center">
      <% if (showProgress) { %>
      <div class="progress-wrap">
        <div class="progress-bar"></div>
      </div>
      <% } %>
    </div>
    <div class="section-bottom"></div>
  `,

  'service:locator': `
    <div class="section-square"></div>
    <div class="section-float flex-middle">
      <% if (!showBtn) { %>
        <p class="small"><%= instructions %></p>
      <% } else { %>
        <button class="btn"><%= send %></button>
      <% } %>
    </div>
  `,

  'service:placer': `
    <div class="section-square<%= mode === 'list' ? ' flex-middle' : '' %>">
      <% if (rejected) { %>
      <div class="fit-container flex-middle"><p><%= reject %></p></div>
      <% } %>
    </div>
    <div class="section-float flex-middle">
      <% if (!rejected) { %>
        <% if (mode === 'graphic') { %>
          <p><%= instructions %></p>
        <% } else if (mode === 'list') { %>
          <% if (showBtn) { %>
            <button class="btn"><%= send %></button>
          <% } %>
        <% } %>
      <% } %>
    </div>
  `,

  'service:platform': `
    <div class="section-top"></div>
    <div class="section-center flex-center">
      <p><%= errorMessage %></p>
    </div>
    <div class="section-bottom"></div>
  `,

  'service:sync': `
    <div class="section-top"></div>
    <div class="section-center flex-center">
      <p class="soft-blink"><%= wait %></p>
    </div>
    <div class="section-bottom"></div>
  `,

  'service:welcome': `
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
        <p class="big">
          <%= welcome %>
          <br />
          <b><%= globals.appName %></b>
        </p>
    </div>
    <div class="section-bottom flex-middle">
      <p class="small soft-blink"><%= touchScreen %></p>
    </div>
  `,

  survey: `
    <div class="section-top">
      <% if (counter <= length) { %>
        <p class="counter"><%= counter %> / <%= length %></p>
      <% } %>
    </div>
    <% if (counter > length) { %>
      <div class="section-center flex-center">
        <p class="big"><%= thanks %></p>
      </div>
    <% } else { %>
      <div class="section-center"></div>
    <% } %>
    <div class="section-bottom flex-middle">
      <% if (counter < length) { %>
        <button class="btn"><%= next %></button>
      <% } else if (counter === length) { %>
        <button class="btn"><%= validate %></button>
      <% } %>
    </div>
  `,
};

export default defaultViewTemplates;