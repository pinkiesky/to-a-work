ymaps.ready(init);

async function geocodeBulk(codes) {
  return Promise.all(codes.map(c => ymaps.geocode(c)));
}

function ejectCoordinates(geocodeBulkArray) {
  return geocodeBulkArray.map((geocode) => {
    const obj = geocode.geoObjects.get(0);
    return obj.geometry.getCoordinates();
  });
}

async function streetsToCoords(streets) {
  const geocodes = await geocodeBulk(streets);
  const ejected = ejectCoordinates(geocodes);
  console.log(ejected);

  return ejected;
}

async function init() {
  const coords = await streetsToCoords([
    'Благовещенск, Трудовая 8',
    'Благовещенск, Ленина 104',
    'Благовещенск, Амурская 188',
  ]); 

  var myMap = new ymaps.Map("map", {
    center: [50.271413, 127.529051],
    zoom: 15,
  }, {
    searchControlProvider: 'yandex#search'
  }),
  // Признак начала редактирования маршрута.
  startEditing = false,
  button = $('#editor');
  
  ymaps.route(coords, {
    // Автоматически позиционировать карту.
    mapStateAutoApply: true
  }).then(function (route) {
    myMap.geoObjects.add(route);
    button.click(function () {
      if (startEditing = !startEditing) {
        // Включаем редактор.
        route.editor.start({addWayPoints: true, removeWayPoints: true});
        button.text('Отключить редактор маршрута');
      } else {
        // Выключаем редактор.
        route.editor.stop();
        button.text('Включить редактор маршрута');
      }
    });
    route.editor.events.add(["waypointadd", "waypointremove", "start"], function () {
      if (route.getWayPoints().getLength() >= 10) {
        // Если на карте больше 9 точек маршрута, отключаем добавление новых точек.
        route.editor.start({addWayPoints: false, removeWayPoints: true});
      }
      else {
        // Включаем добавление новых точек.
        route.editor.start({addWayPoints: true, removeWayPoints: true});
      }
    })
  }, function (error) {
    alert("Возникла ошибка: " + error.message);
  });
}