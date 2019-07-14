var app = new Vue({
  el: '#container',
  data: {
    wayPoints: [1,14,13,15,12,11,4,5,10,9,8,7,6,2,3,16],
    streets: [
      'Хабаровск, Краснореченская 96',
      'Хабаровск, Орджоникидзе 4а',
      'Хабаровск, Запарина 139',
      'Хабаровск, Войкова 8',
      'Хабаровск, Лазо 11',
      'Хабаровск, Известковая 33',
      'Хабаровск, Стрельникова 15',
      'Хабаровск, Широкая 42',
      'Хабаровск, Авроры 14',
      'Хабаровск, Сергеевская 6',
      'Хабаровск, Олега Кошевого 7а',
      'Хабаровск, Калараша 6Б',
      'Хабаровск, Вахова 8Б',
      'Хабаровск, Краснореченская 155',
      'Хабаровск, Клубная 26',
      'Хабаровск, Муравьёва-Амурского 4',
    ],
    streetsCoords: null,
    peoples: [
      'Автовокзал',
      'Гуляева Ю.В., +7 909 972 53 85',
      'Соболев П.Е., +7 962 235 12 48',
      'Дементьева И.Д., +7 909 362 90 56',
      'Рябов О.В., +7 963 110 07 00',
      'Богданов С.Л., +7 909 035 42 11',
      'Иванова У.А, +7 963 442 90 28',
      'Соколов Я.Д, +7 909 905 91 45',
      'Лыткина Д.Я., +7 962 300 41 66',
      'Лукашенко Ж.Л., +7 909 764 77 54',
      'Коломоец У.В., +7 962 601 74 17',
      'Никонов Ф.Г., +7 909 706 25 11',
      'Батейко Я.М., +7 962 664 20 07',
      'Максимова Х.В., +7 909 725 57 04',
      'Абрамова Н.А., +7 963 152 56 99',
      'ООО "Вектор"'
    ],
    startCoords: [50.271413, 127.529051],
    zoom: 15,
    map: null,
    busElem: document.getElementById('bus'),
    busCoord: null,
  },
  async mounted() {
    ymaps.ready(this.yaInit);
  },
  computed: {
    normStreets() {
      return this.wayPoints
        .map(index => this.streets[index - 1]);
    },
  },
  watch: {
    busCoord(newPos) {
      const projection = this.map.options.get('projection');
        const [x, y] = this.map.converter.globalToPage(
          projection.toGlobalPixels(
              newPos,
              this.map.getZoom()
          )
        );

        this.busElem.style.left = (x - 14) + 'px';
        this.busElem.style.top = (y - 14) + 'px';
    }
  },
  methods: {
    recalcRoute() {

    },
    async yaInit() {
      console.log(this.normStreets);
      setInterval(() => {
        if (!this.busCoords) {
          return;
        }

        this.busCoords[this.busCoords.$index || 0]

        this.busCoords.$index = (this.busCoords.$index || 0) + 1;
        this.busCoords.$index %= this.busCoords.length;
      }, 100);
  
      this.streetsCoords = await streetsToCoords(this.normStreets);  
      this.map = new ymaps.Map("map", {
        center: this.startCoords,
        zoom: this.zoom,
        controls: [],
      }, {
        searchControlProvider: 'yandex#search'
      });
      
      const route = await ymaps.route(this.normStreets, {
        mapStateAutoApply: true
      });
      this.paths = route.getPaths();

      this.busCoords = [];
      this.paths.each((path, index) => {
        console.log(index);
        this.busCoords = this.busCoords
          .concat(path.geometry.getCoordinates());
      });
      
      this.map.geoObjects.add(route);
    },
  },
});