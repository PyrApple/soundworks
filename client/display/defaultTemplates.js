/**
 * The default templates for the shipped modules. The templates are organized according to the `Module.name` property.
 *
 * These template are internally parsed using `lodash.template`, see [https://lodash.com/docs#template](https://lodash.com/docs#template) for more information.
 *
 * @type {Object}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  'service:checkin': '\n    <% if (label) { %>\n      <div class="section-top flex-middle">\n        <p class="big"><%= labelPrefix %></p>\n      </div>\n      <div class="section-center flex-center">\n        <div class="checkin-label">\n          <p class="huge bold"><%= label %></p></div>\n      </div>\n      <div class="section-bottom flex-middle">\n        <p class="small"><%= labelPostfix %></p>\n      </div>\n    <% } else { %>\n      <div class="section-top"></div>\n      <div class="section-center flex-center">\n        <p class="big"><%= error ? errorMessage : wait %></p>\n      </div>\n      <div class="section-bottom"></div>\n    <% } %>\n  ',

  'service:control': '\n    <h1 class="big"><%= title %></h1>\n  ',

  'service:loader': '\n    <div class="section-top flex-middle">\n      <p><%= loading %></p>\n    </div>\n    <div class="section-center flex-center">\n      <% if (showProgress) { %>\n      <div class="progress-wrap">\n        <div class="progress-bar"></div>\n      </div>\n      <% } %>\n    </div>\n    <div class="section-bottom"></div>\n  ',

  'service:locator': '\n    <div class="section-square flex-middle"></div>\n    <div class="section-float flex-middle">\n      <% if (!showBtn) { %>\n        <p class="small"><%= instructions %></p>\n      <% } else { %>\n        <button class="btn"><%= send %></button>\n      <% } %>\n    </div>\n  ',

  'service:orientation': '\n    <div class="section-top"></div>\n    <div class="section-center flex-center">\n      <p><%= !error ? instructions : errorMessage %></p>\n    </div>\n    <div class="section-bottom flex-middle">\n      <% if (!error) { %>\n        <button class="btn"><%= send %></button>\n      <% } %>\n    </div>\n  ',

  'service:placer': '\n    <div class="section-square flex-middle"></div>\n    <div class="section-float flex-middle">\n      <% if (mode === \'graphic\') { %>\n        <p><%= instructions %></p>\n      <% } else if (mode === \'list\') { %>\n        <% if (showBtn) { %>\n          <button class="btn"><%= send %></button>\n        <% } %>\n      <% } %>\n    </div>\n  ',

  'service:sync': '\n    <div class="section-top"></div>\n    <div class="section-center flex-center">\n      <p class="soft-blink"><%= wait %></p>\n    </div>\n    <div class="section-bottom"></div>\n  ',

  'service:welcome': '\n    <div class="section-top flex-middle">\n      <% if (!error) { %>\n        <p class="big"><%= welcome %> <br /><b><%= globals.appName %></b></p>\n      <% } %>\n    </div>\n    <div class="section-center flex-center">\n      <% if (error) { %>\n        <p class="big"><%= error %></p>\n      <% } else { %>\n        <p class="small"><%= touchScreen %></p>\n      <% } %>\n    </div>\n    <div class="section-bottom flex-middle"></div>\n  ',

  survey: '\n    <div class="section-top">\n      <% if (counter <= length) { %>\n        <p class="counter"><%= counter %> / <%= length %></p>\n      <% } %>\n    </div>\n    <% if (counter > length) { %>\n      <div class="section-center flex-center">\n        <p class="big"><%= thanks %>\n      </div>\n    <% } else { %>\n      <div class="section-center"></div>\n    <% } %>\n    <div class="section-bottom flex-middle">\n      <% if (counter < length) { %>\n        <button class="btn"><%= next %></button>\n      <% } else if (counter === length) { %>\n        <button class="btn"><%= validate %></button>\n      <% } %>\n    </div>\n  '

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvZGlzcGxheS9kZWZhdWx0VGVtcGxhdGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztxQkFPZTtBQUNiLG1CQUFpQixtb0JBbUJoQjs7QUFFRCxtQkFBaUIsK0NBRWhCOztBQUVELGtCQUFnQix5VUFZZjs7QUFFRCxtQkFBaUIsMlJBU2hCOztBQUVELHVCQUFxQix1VEFVcEI7O0FBRUQsa0JBQWdCLGlXQVdmOztBQUVELGdCQUFjLDRMQU1iOztBQUVELG1CQUFpQiwrYkFjaEI7O0FBR0QsUUFBTSw2bkJBb0JMOztDQUVGIiwiZmlsZSI6InNyYy9jbGllbnQvZGlzcGxheS9kZWZhdWx0VGVtcGxhdGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgZGVmYXVsdCB0ZW1wbGF0ZXMgZm9yIHRoZSBzaGlwcGVkIG1vZHVsZXMuIFRoZSB0ZW1wbGF0ZXMgYXJlIG9yZ2FuaXplZCBhY2NvcmRpbmcgdG8gdGhlIGBNb2R1bGUubmFtZWAgcHJvcGVydHkuXG4gKlxuICogVGhlc2UgdGVtcGxhdGUgYXJlIGludGVybmFsbHkgcGFyc2VkIHVzaW5nIGBsb2Rhc2gudGVtcGxhdGVgLCBzZWUgW2h0dHBzOi8vbG9kYXNoLmNvbS9kb2NzI3RlbXBsYXRlXShodHRwczovL2xvZGFzaC5jb20vZG9jcyN0ZW1wbGF0ZSkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAnc2VydmljZTpjaGVja2luJzogYFxuICAgIDwlIGlmIChsYWJlbCkgeyAlPlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICAgIDxwIGNsYXNzPVwiYmlnXCI+PCU9IGxhYmVsUHJlZml4ICU+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNoZWNraW4tbGFiZWxcIj5cbiAgICAgICAgICA8cCBjbGFzcz1cImh1Z2UgYm9sZFwiPjwlPSBsYWJlbCAlPjwvcD48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+XG4gICAgICAgIDxwIGNsYXNzPVwic21hbGxcIj48JT0gbGFiZWxQb3N0Zml4ICU+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICAgIDxwIGNsYXNzPVwiYmlnXCI+PCU9IGVycm9yID8gZXJyb3JNZXNzYWdlIDogd2FpdCAlPjwvcD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG4gICAgPCUgfSAlPlxuICBgLFxuXG4gICdzZXJ2aWNlOmNvbnRyb2wnOiBgXG4gICAgPGgxIGNsYXNzPVwiYmlnXCI+PCU9IHRpdGxlICU+PC9oMT5cbiAgYCxcblxuICAnc2VydmljZTpsb2FkZXInOiBgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICA8cD48JT0gbG9hZGluZyAlPjwvcD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgIDwlIGlmIChzaG93UHJvZ3Jlc3MpIHsgJT5cbiAgICAgIDxkaXYgY2xhc3M9XCJwcm9ncmVzcy13cmFwXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXJcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICBgLFxuXG4gICdzZXJ2aWNlOmxvY2F0b3InOiBgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tc3F1YXJlIGZsZXgtbWlkZGxlXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tZmxvYXQgZmxleC1taWRkbGVcIj5cbiAgICAgIDwlIGlmICghc2hvd0J0bikgeyAlPlxuICAgICAgICA8cCBjbGFzcz1cInNtYWxsXCI+PCU9IGluc3RydWN0aW9ucyAlPjwvcD5cbiAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIj48JT0gc2VuZCAlPjwvYnV0dG9uPlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICBgLFxuXG4gICdzZXJ2aWNlOm9yaWVudGF0aW9uJzogYFxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgPHA+PCU9ICFlcnJvciA/IGluc3RydWN0aW9ucyA6IGVycm9yTWVzc2FnZSAlPjwvcD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj5cbiAgICAgIDwlIGlmICghZXJyb3IpIHsgJT5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiPjwlPSBzZW5kICU+PC9idXR0b24+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgJ3NlcnZpY2U6cGxhY2VyJzogYFxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXNxdWFyZSBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWZsb2F0IGZsZXgtbWlkZGxlXCI+XG4gICAgICA8JSBpZiAobW9kZSA9PT0gJ2dyYXBoaWMnKSB7ICU+XG4gICAgICAgIDxwPjwlPSBpbnN0cnVjdGlvbnMgJT48L3A+XG4gICAgICA8JSB9IGVsc2UgaWYgKG1vZGUgPT09ICdsaXN0JykgeyAlPlxuICAgICAgICA8JSBpZiAoc2hvd0J0bikgeyAlPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIj48JT0gc2VuZCAlPjwvYnV0dG9uPlxuICAgICAgICA8JSB9ICU+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgJ3NlcnZpY2U6c3luYyc6IGBcbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3BcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgIDxwIGNsYXNzPVwic29mdC1ibGlua1wiPjwlPSB3YWl0ICU+PC9wPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICBgLFxuXG4gICdzZXJ2aWNlOndlbGNvbWUnOiBgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICA8JSBpZiAoIWVycm9yKSB7ICU+XG4gICAgICAgIDxwIGNsYXNzPVwiYmlnXCI+PCU9IHdlbGNvbWUgJT4gPGJyIC8+PGI+PCU9IGdsb2JhbHMuYXBwTmFtZSAlPjwvYj48L3A+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICA8JSBpZiAoZXJyb3IpIHsgJT5cbiAgICAgICAgPHAgY2xhc3M9XCJiaWdcIj48JT0gZXJyb3IgJT48L3A+XG4gICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICA8cCBjbGFzcz1cInNtYWxsXCI+PCU9IHRvdWNoU2NyZWVuICU+PC9wPlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICBgLFxuXG5cbiAgc3VydmV5OiBgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+XG4gICAgICA8JSBpZiAoY291bnRlciA8PSBsZW5ndGgpIHsgJT5cbiAgICAgICAgPHAgY2xhc3M9XCJjb3VudGVyXCI+PCU9IGNvdW50ZXIgJT4gLyA8JT0gbGVuZ3RoICU+PC9wPlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICAgIDwlIGlmIChjb3VudGVyID4gbGVuZ3RoKSB7ICU+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgPHAgY2xhc3M9XCJiaWdcIj48JT0gdGhhbmtzICU+XG4gICAgICA8L2Rpdj5cbiAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyXCI+PC9kaXY+XG4gICAgPCUgfSAlPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPlxuICAgICAgPCUgaWYgKGNvdW50ZXIgPCBsZW5ndGgpIHsgJT5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiPjwlPSBuZXh0ICU+PC9idXR0b24+XG4gICAgICA8JSB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IGxlbmd0aCkgeyAlPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuXCI+PCU9IHZhbGlkYXRlICU+PC9idXR0b24+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gIGAsXG5cbn07XG4iXX0=