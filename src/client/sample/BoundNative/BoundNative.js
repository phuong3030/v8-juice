function createThem(count)
{
    print(arguments.callee.name+"() ------------------------------------------");
    print("Constructing",count,"BoundNative objects.");
    function interruptionPoint()
    {
        mssleep(1);
    }
    var b;
    for( var i = 0; i < count;++i )
    {
        b = new BoundNative();
        //delete b;
        if( 0 == (i%333) )
        {
            print("Interruption point.");
            //gc();
            interruptionPoint();
        }
        
    }
    print('b ==',b,'typeof b ==',typeof b);
    print("Constructed",count,"BoundNative objects.");
    return b;
}

function dumpBoundNative(b,msg)
{
    print(arguments.callee.top);    
    if( msg ) print(msg);
    print('b.toString() ==',b.toString());
    print('b.toString2() ==',b.toString2());
    print('b.version() ==',b.version());
    print('b.doSomething() ==',b.doSomething("hi, world"));
    print('b.getInt() ==',b.getInt());
    print('b.setInt(17) ==',b.setInt(17));
    print('b.getInt() ==',b.getInt());
    print('b.myInt ==',b.myInt);
    print('b.myInt += 17 ==',b.myInt += 17);
    print('b.myInt ==',b.myInt);
    print('b.intGetter ==',b.intGetter);
    print('b.intGetter=3 ==',b.intGetter=3);
    print('b.intGetter ==',b.intGetter);
    print('b.publicProperty ==',b.publicProperty);
    print('b.publicProperty/=3 ==',b.publicProperty/=3);
    print('b.publicProperty ==',b.publicProperty);
    print('b.publicPropertyRO ==',b.publicPropertyRO);
    print('b.publicPropertyRO=13 ==',b.publicPropertyRO=13);
    print('b.publicPropertyRO ==',b.publicPropertyRO);
    print(arguments.callee.bottom);
}
dumpBoundNative.top =    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv';
dumpBoundNative.bottom = '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^';
function testOne()
{
    print(arguments.callee.name+"() ------------------------------------------");
    var ar = [];
    var b = null;
    var total = 0;

    var loops = 2;
    for( var i = 0; i < loops; ++i )
    {
        var c = 2;
        print("Creating",c,"objects...");
        b = createThem(c);
        total += c;
        if(1)
        {
            ar.push( b ); // keep a reference to ensure that gc doesn't reap it.
            //b.destroy();
        }
        print("b ==",b);//"b.foo ==",b.foo);
        //gc();
        print("Created",c,"objects...");
    }
    print("Done. Created",total,"objects in total.");
    dumpBoundNative(b,"BoundNative object:");
    if(1)
    {
        var b2 = new BoundNative();
        print('b.ptr(b) ==',b.ptr(b));
        if( b.getPtr )
        {
            print('b.getPtr() ==',b.getPtr());
        }
        print('b.ptr(b2) ==',b.ptr(b2));
        print('b2.ptr(0) ==',b2.ptr(0));
        delete b2;
    }
    if(0)
    {
        var stime = 1;
        print("b.sleep("+stime+")...");
        b.sleep(stime);
        print("b.sleep("+stime+")'d!");
    }
    print('b.instanceCount() ==',b.instanceCount());
    print("b.destroy()...");
    b.destroy();
    print('BoundNative.instanceCount() ==',BoundNative.instanceCount());
}

function testTwo()
{
    print(arguments.callee.name+"() ------------------------------------------");
    print('BoundNative.instanceCount() before New ==',BoundNative.instanceCount());
    var b = new BoundNative;
    print('BoundNative.instanceCount() after New ==',BoundNative.instanceCount());
    b.destroy();
    print('BoundNative.instanceCount() after b.destroy() ==',BoundNative.instanceCount());
    //gc();
}

function testInheritance1()
{
    print(arguments.callee.name+"() ------------------------------------------");
    function MyClass()
    {
        this.prototype = this.__proto__ = new BoundNative(193,242.424);
        this.prototype.constructor = MyClass;
        return this;
    }
    MyClass.prototype = BoundNative;

    function YourClass()
    {
        this.prototype = this.__proto__ = new MyClass();
        this.prototype.constructor = YourClass;
        return this;
    }
    YourClass.prototype = MyClass;

    
    var m = new MyClass();
    dumpBoundNative(m,"This is m:");
    print("m instanceof BoundNative ==",m instanceof BoundNative);
    var y = new YourClass();
    print("y instanceof BoundNative ==",y instanceof BoundNative);
    print("m.ptr(y)",m.ptr(y));
    print("y.ptr(m)",y.ptr(m));
    print("m.debug ==",m.debug,", y.debug ==",y.debug);
    print("y.debug = !y.debug ==",y.debug=!y.debug);
    print("m.debug ==",m.debug,", y.debug ==",y.debug);
    print("m.debugRO ==",m.debugRO);
    print("y.debug = !y.debug ==",y.debug=!y.debug);
    m.debugRO = "assignment should be a no-op";
    print("m.debug ==",m.debug,", m.debugRO ==",m.debugRO);
    if(1)
    {
        print('BoundNative.instanceCount() before y.destroy() ==',BoundNative.instanceCount());
        print("Calling y.destroy()...");
        y.destroy();
        print('BoundNative.instanceCount() after y.destroy() ==',BoundNative.instanceCount());
        try
        {
            print("y.ptr(m)",y.ptr(m));
        }
        catch(e)
        {
            print("Good: as expected, y.ptr(m) threw.");
        }
    }
}

function testThree()
{
    print(arguments.callee.name+"() ------------------------------------------");
    var b = null;
    try
    {
        b = BoundNative();
        print("Construction without new ==",b);
        b.destroy();
        delete b;
    }
    catch(e)
    {
        print("Construction without 'new' is apparently disabled.");
    }
}

function testNativeSubclass()
{
    var s = new BoundSub();
    print( 's =',s);
    print( 's.ptr(s) =',s.ptr(s));
    dumpBoundNative(s,"BoundSub object:");
    print('BoundNative.instanceCount() before s.destroy() ==',BoundNative.instanceCount());
    s.destroy();
    print('BoundNative.instanceCount() before y.destroy() ==',BoundNative.instanceCount());
    var exp = null;
    try
    {
        s.ptr(s); // should throw
        return;
    }
    catch(e)
    { exp = e; /* this is what we expected. */}
    if( ! exp )
    {
        throw new Error("s.memfunc() call did not throw after s.destroy()!");
    }
}

////////////////////////////////////////////////////////////////////////
//BoundNative.prototype.debug = false;
// testOne();
// testTwo();
// testThree();
if(true) if( BoundNative.supportsInheritance )
{
    testInheritance1();
}
else
{
    print("Skipping JS inheritance tests.");
}
testNativeSubclass();

print("BoundNative.supportsInheritance ==",BoundNative.supportsInheritance);
print("BoundNative.debug ==",BoundNative.debug);
print("BoundNative.prototype.debug ==",BoundNative.prototype.debug);
print('BoundNative.instanceCount() ==',BoundNative.instanceCount());
print("Done! You win!");

