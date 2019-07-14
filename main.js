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
      'Юрий, +7 909 972 53 85',
      'Павел, +7 962 235 12 48',
      'Анна, +7 909 362 90 56',
      'Олег, +7 963 110 07 00',
      'Станислав, +7 909 035 42 11',
      'Ульяна, +7 963 442 90 28',
      'Ярослав, +7 909 905 91 45',
      'Диана, +7 962 300 41 66',
      'Жора, +7 909 764 77 54',
      'Андрей, +7 962 601 74 17',
      'Филипп, +7 909 706 25 11',
      'Ярослава, +7 962 664 20 07',
      'Христина, +7 909 725 57 04',
      'Наталья, +7 963 152 56 99',
      'ООО "Вектор"'
    ],
    startCoords: [50.271413, 127.529051],
    zoom: 15,
    map: null,
    route: null,
    busElem: document.getElementById('bus'),
    busCoord: null,
    timeInRoad: 0,
  },
  async mounted() {
    ymaps.ready(this.yaInit);
  },
  computed: {
    normStreets() {
      return this.wayPoints
        .map(index => this.streets[index - 1]);
    },
    closestBusPoint() {
      if (!this.busCoords) {
        return null;
      }

      const min = this.busCoords[0];
      const minDist = Number.MAX_SAFE_INTEGER;
      this.busCoords.forEach((coord) => {
        const dist = Math.abs((coord[0] - min[0]) + (coord[1] - min[1]));
        if (dist < minDist) {
          min = coord;
          minDist = dist;
        }
      });

      return min;
    },
    timeForRoad() {
      if (!this.route) {
        return 'Н/Д';
      }

      return this.route.getHumanJamsTime();
    }
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
    async recalcRoute() {
      if (this.route) {
        this.map.geoObjects.remove(this.route);
        this.route = null;
      }

      this.route = await ymaps.route(this.normStreets, {
        mapStateAutoApply: true
      });
      this.paths = this.route.getPaths();

      this.busCoords = [];
      this.paths.each((path) => {
        this.busCoords = this.busCoords
          .concat(path.geometry.getCoordinates());
      });
      
      this.map.geoObjects.add(this.route);
      // FIXME interval leak
      setInterval(() => {
        this.timeInRoad += 1;
      });
    },
    async yaInit() {
      setInterval(() => {
        if (!this.busCoords) {
          return;
        }

        this.busCoord = this.busCoords[this.busCoords.$index || 0];

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
      
      this.recalcRoute();
    },
  },
});