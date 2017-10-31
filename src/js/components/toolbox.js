/* ************************************************************************
TOOLBOX VIEW
************************************************************************* */

(function makeToolboxView() {
  const htmlBox = $('.valid-container.html-validator');
  const cssBox = $('.valid-container.css-validator');
  const toolsBox = $('.tools-container');
  const speedBox = $('.page-speed-container');

  function toggleToolbox(e) {
    if (htmlBox.is(':visible') && !htmlBox.find(e.target).length) {
      htmlBox.fadeOut();
    } else if (!htmlBox.is(':visible') && e.target === $('#html-val')[0]) {
      toolsBox.fadeOut();
      htmlBox.fadeIn();
    } else if (speedBox.is(':visible') && !speedBox.find(e.target).length) {
      speedBox.fadeOut();
    } else if (!speedBox.is(':visible') && e.target === $('#insights')[0]) {
      toolsBox.fadeOut();
      speedBox.fadeIn();
    } else if (cssBox.is(':visible') && !cssBox.find(e.target).length) {
      cssBox.fadeOut();
    } else if (!cssBox.is(':visible') && e.target === $('#css-val')[0]) {
      toolsBox.fadeOut();
      cssBox.fadeIn();
    } else if (toolsBox.is(':visible') && !toolsBox.find(e.target).length) {
      toolsBox.fadeOut();
    } else if (!toolsBox.is(':visible') && e.target === $('.fa-wrench')[0]) {
      toolsBox.fadeIn();
    }
  }

  window.app.toolboxView = {
    toggleToolbox,
  };
}());

/* ************************************************************************
PAGE SPEED MODEL
************************************************************************* */
(function makePageSpeedModel() {
  // Object that will hold the callbacks that process results from the PageSpeed Insights API.
  const API_KEY = 'AIzaSyDKAeC02KcdPOHWVEZqdR1t5wwgaFJJKiM';
  const API_URL = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?';

  window.app.pagespeedModel = {
    API_KEY,
    API_URL,
  };
}());

/* ************************************************************************
PAGE SPEED VIEW
************************************************************************* */

(function makePageSpeedView() {
  function displayPageSpeedScore(result) {
    const region = document.getElementById('output');
    const rules = result.formattedResults.ruleResults;
    const redirects = rules.AvoidLandingPageRedirects;
    const compress = rules.EnableGzipCompression;
    const caching = rules.LeverageBrowserCaching;
    const responseTime = rules.MainResourceServerResponseTime;
    const minCss = rules.MinifyCss;
    const minHtml = rules.MinifyHTML;
    const minJs = rules.MinifyJavaScript;
    const resources = rules.MinimizeRenderBlockingResources;
    const images = rules.OptimizeImages;
    const content = rules.PrioritizeVisibleContent;
    const rulesArray = [redirects, compress, caching, responseTime, minCss, minHtml,
      minJs, resources, images, content];
    const possibleRules = [];
    const foundRules = [];

    rulesArray.map((i) => {
      if (i.ruleImpact > 0) {
        possibleRules.push(i);
        possibleRules.sort((a, b) => b.ruleImpact - a.ruleImpact);
      } else {
        foundRules.push(i);
      }
      return i;
    });

    $('#output').hide().slideDown(500);
    $('#possible').hide().slideDown(500);
    $('#found').hide().slideDown(500);

    $(`
      <div class="speed-score-box">
        <h4 id="results-speed-title">Score: ${result.ruleGroups.SPEED.score}</h4>
        <span>URL: ${result.id}</span>
      </div>
      `).appendTo(region);
    if ($('.toggle-custom-view:checked').val() === 'mobile') {
      $('#results-speed-title').prepend('Mobile ');
    } else {
      $('#results-speed-title').prepend('Desktop ');
    }

    // Make container for possible optimizations
    const possible = document.getElementById('possible');
    if (possibleRules.length > 0) {
      $('<h1 class=optimizationTitles>Possible Optimizations</h1>').appendTo(possible);
    } else {
      $('<h1 class=optimizationTitles>Congratulations! No issues found.</h1>').appendTo(possible);
    }

    possibleRules.map((i) => {
      $(`<h4 class="speedTitles">${i.localizedRuleName}</h4>`).appendTo(possible);
      // possible.append(`${i.localizedRuleName}\n`);
      $(`
        <button class="click-details inactive" type="submit" id="${possibleRules.indexOf(i)}button">More Details</button>
        <div class="addInfo" id="${possibleRules.indexOf(i)}">
          <span id="${possibleRules.indexOf(i)}info"></span>
          <span><a href="#" id="${possibleRules.indexOf(i)}link" class="learn-more-link" target="_blank"></a></span>
          <span id="${possibleRules.indexOf(i)}these"></span>
        </div>
      `).appendTo(possible);

      const first = $(`#${possibleRules.indexOf(i)}info`);
      const second = $(`#${possibleRules.indexOf(i)}link`);
      const third = $(`#${possibleRules.indexOf(i)}these`);

      $('#output').hide().slideDown(500);
      $('#possible').hide().slideDown(500);
      $('#found').hide().slideDown(500);
      $(`#${possibleRules.indexOf(i)}`).hide();

      // Show more info when clicking 'More Details' button
      $(`#${possibleRules.indexOf(i)}button`).on('click', () => {
        if ($(`#${possibleRules.indexOf(i)}button`)[0].className === 'click-details inactive') {
          $(`#${possibleRules.indexOf(i)}button`).removeClass('inactive');
          $(`#${possibleRules.indexOf(i)}button`).addClass('active');
          $(`#${possibleRules.indexOf(i)}button`).text('Less Details');

          // Show possible optimizations
          // Specific test cases per rule
          for (let j = 0; j < i.urlBlocks.length; j += 1) {
            if (i.urlBlocks.length >= 2 && j === 0) {
              first.append(`${i.urlBlocks[j].header.format}\n`);
            }
            if (i.urlBlocks.length >= 2 && j === 1) {
              second.append(`${i.localizedRuleName} of the following:\n`);
              second.attr('href', `${i.urlBlocks[j].header.args[0].value}`);
              for (let k = 0; k < i.urlBlocks[j].urls.length; k += 1) {
                third.append(`${i.urlBlocks[j].urls[k].result.args[0].value}\n`);
              }
            }
            if (i.urlBlocks.length < 2) {
              if (j === 0) {
                if (i.localizedRuleName === 'Reduce server response time') {
                  first.append(`In our test, your server responded in ${i.urlBlocks[j].header.args[0].value}. There are many factors that can slow down your server response time. Please read our recommendations to learn how you can monitor and measure where your server is spending the most time.\n`);
                  second.append('Learn More');
                  second.attr('href', `${i.urlBlocks[j].header.args[1].value}`);
                } else if (i.localizedRuleName === 'Prioritize visible content') {
                  first.append(`${i.summary.format}\n`);
                  second.append(`${i.localizedRuleName} of the following:\n`);
                  second.attr('href', `${i.urlBlocks[j].header.args[0].value}`);
                  third.append(`${i.urlBlocks[j].urls[0].result.format}\n`);
                } else {
                  first.append(`${i.summary.format}\n`);
                  second.append(`${i.localizedRuleName} of the following:\n`);
                  second.attr('href', `${i.urlBlocks[j].header.args[0].value}`);
                  for (let k = 0; k < i.urlBlocks[j].urls.length; k += 1) {
                    third.append(`${i.urlBlocks[j].urls[k].result.args[0].value}\n`);
                  }
                }
              }
              if (j === 1) {
                if (i.localizedRuleName === 'Prioritize visible content') {
                  third.append(`${i.urlBlocks[j].header.format}\n`);
                  second.append(`${i.localizedRuleName}\n`);
                  second.attr('href', `${i.urlBlocks[j].header.args[0].value}`);
                } else if (i.localizedRuleName === 'Reduce server response time') {
                  first.append(`In our test, your server responded in ${i.urlBlocks[j].header.args[0].value}. There are many factors that can slow down your server response time. Please read our recommendations to learn how you can monitor and measure where your server is spending the most time.\n`);
                  second.append('Learn More');
                  second.attr('href', `${i.urlBlocks[j].header.args[1].value}`);
                } else {
                  second.append(`${i.localizedRuleName} of the following:\n`);
                  second.attr('href', `${i.urlBlocks[j].header.args[0].value}`);
                  for (let k = 0; k < i.urlBlocks[j].urls.length; k += 1) {
                    third.append(`${i.urlBlocks[j].urls[k].result.args[0].value}\n`);
                  }
                }
              }
            }
          }
          $(`#${possibleRules.indexOf(i)}`).slideDown(500);
        } else {
          $(`#${possibleRules.indexOf(i)}button`).removeClass('active');
          $(`#${possibleRules.indexOf(i)}button`).addClass('inactive');
          $(`#${possibleRules.indexOf(i)}button`).text('More Details');
          $(`#${possibleRules.indexOf(i)}`).slideUp(500, () => {
            first.empty();
            second.empty();
            second.attr('href', '#');
            third.empty();
          });
        }
      });
      return i;
    });

    // Create top of found optimizations container
    const found = document.getElementById('found');
    $('<h1 class=optimizationTitles>Optimizations Found</h1>').appendTo(found);
    $('<button class="click-details inactive" type="submit" id="moreFoundOptimizations">More Details</button><div class="addFoundOptimizations"</div>').appendTo(found);

    // Show more info when clicking 'More Details' button
    $('#moreFoundOptimizations').on('click', () => {
      if ($('#moreFoundOptimizations')[0].className === 'click-details inactive') {
        $('#moreFoundOptimizations').removeClass('inactive');
        $('#moreFoundOptimizations').addClass('active');
        $('#moreFoundOptimizations').text('Less Details');
        $('.addFoundOptimizations').hide();

        foundRules.map((m) => {
          $(`
            <div class="addFoundInfo">
              <h4 id="${foundRules.indexOf(m)}title" class="speedTitles"></h4>
              <div><a href="#" id="${foundRules.indexOf(m)}anchor" class="learn-more-link" target="_blank"></a></div>
            </div>
            `).appendTo($('.addFoundOptimizations'));

          const title = $(`#${foundRules.indexOf(m)}title`);
          const link = $(`#${foundRules.indexOf(m)}anchor`);

          // Show found optimizations
          // Fill container for found optimizations
          title.append(`${m.localizedRuleName}`);
          link.append('Learn More');
          link.attr('href', `${m.summary.args[0].value}`);
          // $(`#${foundRules.indexOf(m)}`).slideDown(500);
          return m;
        });
        $('.addFoundOptimizations').slideDown(500);
      } else {
        $('#moreFoundOptimizations').removeClass('active');
        $('#moreFoundOptimizations').addClass('inactive');
        $('#moreFoundOptimizations').text('More Details');
        $('.addFoundOptimizations').slideUp(500, () => {
          $('.addFoundOptimizations').empty();
        });
      }
    });
    $('.returnresults').slideDown(500);
    $('#loader-icon').removeClass('spin').hide();
    $('#analyzePage').removeAttr('disabled', 'disabled');
    $('.toggle-custom-view').removeAttr('disabled', 'disabled');
    $('#clearPage').removeAttr('disabled', 'disabled');
  }

  window.app.pagespeedView = {
    displayPageSpeedScore,
  };
}());

/* ************************************************************************
HTML VALIDATOR MODEL
************************************************************************* */
(function makeHtmlModel() {
  const format = function getData(data) {
    const useData = data.messages;
    function filter(filterdata) {
      return (`Type: ${filterdata.type}\nLine: ${filterdata.lastLine}\nMessage: ${filterdata.message}\n\n`);
    }
    return (useData.map(filter).join(''));
  };

  window.app.htmlModel = {
    format,
  };
}());

/* ************************************************************************
HTML VALIDATOR VIEW
************************************************************************* */

(function makeHtmlValidatorView() {
  const $output = $('#html-validated>code');

  function successOutput(result) {
    $output.text(result);
  }

  function errorOutput() {
    $output.text('Sorry, it looks like this code is outdated. Please update your extension or feel free to send a pull request with your own personal updates.');
  }

  window.app.htmlView = {
    successOutput,
    errorOutput,
  };
}());

/* ************************************************************************
CSS VALIDATOR MODEL
************************************************************************* */

(function makeCSSValidatorModel() {
  function format(type, line, message) {
    return `
    Type: ${type}
    Line: ${line}
    Message: ${message}
    `;
  }
  window.app.cssModel = {
    format,
  };
}());

/* ************************************************************************
CSS VALIDATOR VIEW
************************************************************************* */

(function makeCSSValidatorView() {
  const $output = $('#css-validated>code');

  function successOutput(results, format) {
    $output.text(results.map((item) => {
      return format(item.type, item.line, item.message);
    }).join(''));
  }

  function errorOutput() {
    $output.text('Error validating code. Please refresh, or try again later.');
  }
  window.app.cssView = {
    successOutput,
    errorOutput,
  };
}());
