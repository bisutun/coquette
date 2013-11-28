var Inputter = require('../src/inputter').Inputter;

var InputReceiver = function() {
  var callbacks = {};
  this.fire = function(eventName, data) {
    if (callbacks[eventName] !== undefined) {
      for (var i = 0; i < callbacks[eventName].length; i++) {
        callbacks[eventName][i](data);
      }
    }
  };

  this.addEventListener = function(eventName, fn) {
    callbacks[eventName] = callbacks[eventName] || [];
    callbacks[eventName].push(fn);
  };
};

describe('inputter', function() {
  describe('input source', function() {
    describe('window', function() {
      beforeEach(function() {
        window = new InputReceiver()
      });

      it('should use window if autoFocus set to false', function() {
        var canvas = {};
        var inp = new Inputter(null, canvas, true);
        window.fire("keydown", { keyCode: 51 });
        expect(inp.isDown(51)).toEqual(true);
      });

      it('should ignore presses on suppressed keys', function() {
        var canvas = {};
        var inp = new Inputter(null, canvas, true);

        var run = false;
        expect(run).toEqual(false);
        window.fire("keydown", {
          keyCode: 32, // space (suppressed key)
          preventDefault: function() {
            run = true;
          }
        });

        expect(run).toEqual(true);
      })
    });

    describe('canvas', function() {
      it('should use canvas if autoFocus set to true', function() {
        var receiver = new InputReceiver();
        var inp = new Inputter(null, receiver, false);
        receiver.fire("keydown", { keyCode: 51 });
        expect(inp.isDown(51)).toEqual(true);
      });

      it('should set contentEditable to true', function() {
        var canvas = new InputReceiver();
        var inp = new Inputter(null, canvas, false);
        expect(canvas.contentEditable).toEqual(true);
      })
    });
  });

  describe('isDown()', function() {
    it('should say down key is down', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      expect(inp.isDown(51)).toEqual(true);
    });

    it('should say never down key is not down', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      expect(inp.isDown(51)).toEqual(false);
    });

    it('should say key that has gone down then up not down', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      expect(inp.isDown(51)).toEqual(true);
      canvas.fire("keyup", { keyCode: 51 });
      expect(inp.isDown(51)).toEqual(false);
    });

    it('should say key that is not down is not down when other key is down', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      expect(inp.isDown(52)).toEqual(false);
    });
  });

  describe('isPressed()', function() {
    it('should say pressed key is pressed', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      expect(inp.isPressed(51)).toEqual(true);
    });

    it('should say pressed key is still pressed after keyup if no update', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      expect(inp.isPressed(51)).toEqual(true);
      canvas.fire("keyup", { keyCode: 51 });
      expect(inp.isPressed(51)).toEqual(true);
    });

    it('should say pressed key is not pressed after keyup if update', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      canvas.fire("keyup", { keyCode: 51 });
      expect(inp.isPressed(51)).toEqual(true);
      inp.update();
      expect(inp.isPressed(51)).toEqual(false);
    });

    it('should say pressed key is not pressed in next tick', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      expect(inp.isPressed(51)).toEqual(true);
      inp.update();
      expect(inp.isPressed(51)).toEqual(false);
    });

    it('should say key is not pressed if get keyup with no preceding keydown', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keyup", { keyCode: 51 });
      expect(inp.isPressed(51)).toEqual(false);
    });

    it('should say key not pressed is not pressed if other key is pressed', function() {
      var canvas = new InputReceiver();
      var inp = new Inputter(null, canvas, false);
      canvas.fire("keydown", { keyCode: 51 });
      expect(inp.isPressed(51)).toEqual(true);
      expect(inp.isPressed(52)).toEqual(false);
    });
  });
});
