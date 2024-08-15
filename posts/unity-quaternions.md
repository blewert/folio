# Introduction
Every year, I end up being wheeled out by the university to talk about quaternions. They know that it's one of those concepts that I could about at length with anyone. I love talking about their uniqueness as a mathematical concept, their history, and of course, their application in representing rotations in 3D space. 

## History
Every article about quaternions simply can't have an introduction to the interesting story of their discovery. The history of these four component numbers (hence *quat*) is fascinating. For years, Sir William Rowan Hamilton struggled with the task of extending complex numbers up to higher spatial dimensions. How to work with complex numbers in $\mathbb{R}^2$ was well understood at the time, though it wasn't clear if they could generalised to $\mathbb{R}^n$. Complex numbers found utility in describing points on the unit circle in 2D space. But what if we wanted to apply the same principle to 3D? 

Hamilton came across this problem as an astronomer, knowing that a generalisable system could provide a useful method of describing the movements of celestial bodies. Planets, stars and the like are all objects in $\mathbb{R}^3$, and as such, using complex numbers to represent their movements would be incredible useful. Hamilton found that adding and subtracting complex numbers in 3D was fairly easy, and the generalisation from $\mathbb{R}^2 \to \mathbb{R}^3$ could be made with little effort. But multiplication was another matter, and it was this problem that Hamilton brooded on for years. In fact, Hamilton was pestered by his son every morning about the topic:

:::blockquote
*Every morning in the early part of October 1843, on my coming down to breakfast, your brother William Edwin [Hamilton's son] and yourself used to ask me: "Well, Papa, can you multiply triples?" Whereto I was always obliged to reply, with a sad shake of the head, "No, I can only add and subtract them."*
:::
— Hamilton, [in a letter](https://www.maths.tcd.ie/pub/HistMath/People/Hamilton/Letters/BroomeBridge.html) to his son Archibald, *August 5 1865*.

A bolt from the blue struck Hamilton as he was walking the canal with his wife on the morning of October 16, 1843. As he was walking, the idea behind quaternions started to shape in his mind. Suddenly, as if from nowhere, the possibility that quadruples can be multiplied struck his mind. He quickly realised that three of these numbers could represent 3D coordinates in space whilst also satisfying their multiplicative ability. He couldn't resist carving the basic rules for their multiplication into the side of Broom Bridge:

$$
    \\[1cm]
    \LARGE i^2 = j^2 = k^2 = ijk = -1
    \\[1cm]
$$

From here, Hamilton quickly excused himself at his next meeting and scurried away to examine his newfound concept in further detail. This is described in his original letter to his son, years after the event:

:::blockquote
*But on the 16th day of the same month - which happened to be a Monday, and a Council day of the Royal Irish Academy - I was walking in to attend and preside, and your mother was walking with me, along the Royal Canal, to which she had perhaps driven; and although she talked with me now and then, yet an under-current of thought was going on in my mind, which gave at last a result, whereof it is not too much to say that I felt at once the importance. An electric circuit seemed to close; and a spark flashed forth, the herald (as I foresaw, immediately) of many long years to come of definitely directed thought and work, by myself if spared, and at all events on the part of others, if I should even be allowed to live long enough distinctly to communicate the discovery. Nor could I resist the impulse - unphilosophical as it may have been - to cut with a knife on a stone of Brougham Bridge, as we passed it, the fundamental formula with the symbols, i, j, k; namely,*

$$i^2 = j^2 = k^2 = ijk = -1 $$

*which contains the Solution of the Problem, but of course, as an inscription, has long since mouldered away. A more durable notice remains, however, on the Council Books of the Academy for that day (October 16th, 1843), which records the fact, that I then asked for and obtained leave to read a Paper on Quaternions, at the First General Meeting of the session: which reading took place accordingly, on Monday the 13th of the November following.*
:::
— Hamilton, [in a letter](https://www.maths.tcd.ie/pub/HistMath/People/Hamilton/Letters/BroomeBridge.html) to his son Archibald, *August 5 1865*.

Fun fact: this original letter describing his discovery has four paragraphs, which Hamilton acknowledges as a *quaternion of paragraphs* which I think is adorable.

Since their discovery as a method of representing points and direction in 3D space, quaternions have found many uses over the years. Perhaps their most famous is in representing rotational systems in 3D space and the fact that they are not prone to [gimbal lock](https://en.wikipedia.org/wiki/Gimbal_lock). Quaternions are employed in space travel frequently, though, the Apollo 11 lander was prone to gimbal lock. As such, Michael Collins famously quipped about ["sending me a fourth gimbal for Christmas?"](https://space.stackexchange.com/questions/30953/did-michael-collins-ask-for-a-fourth-gimbal-for-christmas-is-there-a-recording); referencing quaternions. They are also used a lot in games development, as quaternions provide a lot of useful functions for us. 

I recently visited Dublin with the sole purpose of catching the LUAS up to Broom Bridge and seeing where Hamilton scrawled his famous formula. I was delighted to see that the station has their multiplicative rules etched into the floor not too far from the LUAS stop. The actual inscription itself has long faded away, though a plaque remains on the bridge itself.

[images]

## Motivation
This post was largely motivated by my recent trip to Dublin, and the lack of resources on quaternions in the Unity documentation. Quaternions are often framed as an evil, hacky, and complicated number system, but I don't believe that. This post intends to discuss some of the somewhat unknown quaternion functions which aren't well discussed in the Unity API documentation. I will also show you some cool things you can do with quaternions!

# Quaternions and Unity
Quaternions in Unity are represented by the `Quaternion` class and the variety of static methods available to you. They are primarily used for representing the rotation of objects in 3D. Manipulating them in Unity is easy and abstracts away from the raw quaternional math involved, for example, in multiplying one quaternion by another. 

The math used in this section will use the notation of $\mathbf{q} = (x, y, z, w)$, in line with Unity's `xyzw` convention. Quaternions are just a 4-tuple of real values, similar to how a `Vector3` is a 3-tuple of real values $[x, y, z]^T$. When expanded, the quaternion $\mathbf{q} \in \mathbb{H}$, where $\mathbb{H}$ is the superset of all quaternions, is simply:

$$ 
\Large\begin{aligned}
    \mathbf{q}  &= (x, y, z, w) \\
                &= w + x \mathbf{i} + y \mathbf{j} + z \mathbf{k}
\end{aligned} 
$$

Note that $x, y, z$ are coefficients of the imaginary units $\mathbf{i}, \mathbf{j}$ and $\mathbf{k}$ respectively. Like complex numbers, e.g. $a + b \mathbf{i}$ or $2 + 10 \mathbf{i}$, quaternions have both real and imaginary parts. Except quaternions have three imaginary units and one real part. In Unity's `xyzw` notation, $x, y$ and $z$ represent the "imaginary parts" and $w$ represents the "real" part. In Unity you don't really poke around with these components directly. However, we will be discussing them throughout this post, so just keep that in mind.

# Unity's Quaternion operators
You may or may not know that the `Quaternion` class can be operated on. There are two operators that can be used, for a total of three overloads:

- Multiplication (`Quaternion` * `Vector3`)
- Multiplication (`Quaternion` * `Quaternion`)
- Relational equality (`Quaternion` == `Quaternion`)

We will discuss each of these in the following sections.

## Quaternion * Vector3
If a quaternion $\mathbf{q} = (x, y, z, w)$ is multiplied by a vector $\mathbf{v} \in \mathbb{R}^3$ (e.g. $\mathbf{v} = [ \mathbf{v}_0, \mathbf{v}_1, \mathbf{v}_2 ]^T$), it rotates the given point by the quaternion. The [documentation](https://docs.unity3d.com/ScriptReference/Quaternion-operator_multiply.html) simply describes this as "Rotates the point `point` with `rotation`" which doesn't help much. So what does this actually do?

We can look at the [Unity C# reference repo](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Quaternion.cs) to get a better idea of what it does:

```cs
 public static Vector3 operator*(Quaternion rotation, Vector3 point)
{
    float x = rotation.x * 2F;
    float y = rotation.y * 2F;
    float z = rotation.z * 2F;
    float xx = rotation.x * x;
    float yy = rotation.y * y;
    float zz = rotation.z * z;
    float xy = rotation.x * y;
    float xz = rotation.x * z;
    float yz = rotation.y * z;
    float wx = rotation.w * x;
    float wy = rotation.w * y;
    float wz = rotation.w * z;

    Vector3 res;
    res.x = (1F - (yy + zz)) * point.x + (xy - wz) * point.y + (xz + wy) * point.z;
    res.y = (xy + wz) * point.x + (1F - (xx + zz)) * point.y + (yz - wx) * point.z;
    res.z = (xz - wy) * point.x + (yz + wx) * point.y + (1F - (xx + yy)) * point.z;
    return res;
}
```

This appears to perform the [standard method](https://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/transforms/index.htm) of multiplying a quaternion $\mathbf{q} \in \mathbb{H}$ against a vector $\mathbf{v} \in \mathbb{R}^3$ as what my professor used to call "a quaternion sandwich". The vector is multiplied by the quaternion $\mathbf{q}$ on the left-hand side, and its conjugate $\mathbf{q}^{-1}$ on the right:

$$ 
    \Large \mathbf{v}' = \mathbf{q} \mathbf{v} \mathbf{q}^{-1}
$$

Unity seems to set the real part $w$ to $1$, i.e. $\mathbf{q} = (x, y, z, 1)$. They also seem to follow the way that [the .NET library](https://github.com/dotnet/runtime/blob/5535e31a712343a63f5d7d796cd874e563e5ac14/src/libraries/System.Private.CoreLib/src/System/Numerics/Vector3.cs#L519C13-L537C15) and [the XNA](https://gamedev.stackexchange.com/a/28418) framework compute the transformation, the reduce the number of operations.

Put simply: it applies a rotation to the point that we multiply it by. You don't have to worry too much about the maths. This is useful for transforming points relative an object's rotation without the use of a `Transform` component. Also note that Unity will not allow you to multiply `Vector3 * Quaternion`, only `Quaternion * Vector3`. This is because the multiplication is non-commutative, the `Vector3` *must* be on the right-hand side. Normally, if you wanted to find the local `x` axis of an object, you'd use `transform.right` or the lengthier `transform.TransformDirection(Vector3.right)`. But what if you don't have access to a transform and only a rotation? This is where this operator would be pretty useful.

One example where I have used this recently is when working with Unity's Splines package. The splines package allows you to sample a forward $z$, up $y$ and right $x$ axis using the `spline.Evaluate(...)` family of functions. You can then use these vectors to form a `Quaternion` to represent the orientation at the sampled point on the spline. This can be manipulated to a) rotate objects by the quaternion, so it looks like they are "moving along" the spline and b) offset points locally with this operator. For example:

```cs
//Sampled position on the spline at t
Vector3 samplePos = spline.Evaluate(...);

//Sampled x, y, and z vectors on the spline at t
Vector3 right = spline.Evaluate(...);
Vector3 up = spline.Evaluate(...);
Vector3 forward = spline.Evaluate(...);

//Build a quaternion which looks along forward, whose up vector is up. This
//omits the forward vector as this can be easily calculated w/ the cross product
Quaternion rotationOnSpline = Quaternion.LookRotation(forward, up);

//Set the rotation!
rollercoasterTrain.rotation = rotationOnSpline;

//Find the left & sides of the track using the rotation
Vector3 leftSideOfTrack = samplePos - (right * rotationOnSpline) * (trackWidth / 2.0f);
Vector3 rightSideOfTrack = samplePos + (right * rotationOnSpline) * (trackWidth / 2.0f);
```

Here is a little example showing the transformation directly:

```cs
//...
[SerializeField] private Transform m_Cube;

private void DrawSolidLine(Vector3 a, Vector3 b, Color col)
{
    Gizmos.color = col;
    Gizmos.DrawLine(a, b);
}

private void DrawDashedLine(Vector3 a, Vector3 b, Color col)
{
    Handles.color = col;
    Handles.DrawDottedLine(a, b, 5.0f);
}

private void OnDrawGizmos()
{
    //Find local left, up and forward vectors of the cube 
    Vector3 leftVec = m_Cube.rotation * Vector3.left;
    Vector3 upVec = m_Cube.rotation * Vector3.up;
    Vector3 fwdVec = m_Cube.rotation * Vector3.forward;

    //Draw the original untransformed axes as dashed lines
    DrawDashedLine(m_Cube.position, m_Cube.position + Vector3.left, Color.yellow);
    DrawDashedLine(m_Cube.position, m_Cube.position + Vector3.up, Color.red);
    DrawDashedLine(m_Cube.position, m_Cube.position + Vector3.forward, Color.blue);

    //Draw the transformed axes as solid lines
    DrawSolidLine(m_Cube.position, m_Cube.position + leftVec, Color.yellow);
    DrawSolidLine(m_Cube.position, m_Cube.position + upVec, Color.red);
    DrawSolidLine(m_Cube.position, m_Cube.position + fwdVec, Color.blue);
}
//...
```

Notices how the local $-x$ (left), $y$ (up) and $z$ (forward) axes are found without using `m_Cube`'s transform at all. Normally you'd expect to see `m_Cube.up` or `m_Cube.TransformDirection(Vector3.up)`. However, this achieves the same result, as can be seen below:

![gif](img/quats/quat-vec3.gif)

Remember, the dashed lines are the original untransformed axes and the solid lines are the transformed ones. As you can see, the transformed vectors align with the local axes of the object. 

This is also useful when you want to apply a rotation locally to a vector, perturbing the vector slightly by some angle. You can imagine this as quite literally taking the vector and rotating it about its origin, along some axis. One example of where this might be useful is representing inaccuracy/recoil of bullets when firing. Normally, a raycast is shot directly from the gun outwards. But sometimes, you want to make the gun a little inaccurate and have a "cone" of bullets. This is normally done by:

- Adding slightly more force upwards/left/right to the bullet upon exit, if physics-based.
- Adding a random global $x$ amount or $y$ amount to the vector.
- Or even more accurate, adding local displacement perturbances with `vec + gun.up * Random.Range(-perturbAmount, perturbAmount)` and similar for `gun.right`.

But what if you specifically wanted to restrict the perturbance based on a cone angle? You'd have to use some trigonometry to figure out how much to perturb on $x$ or $y$ on the local axis of the gun such that an cone angle $\theta$ is satisfied. It's not the hardest thing to do, but it can get ugly quickly. Is there a more elegant solution by using quaternions?

Luckily, this can be done fairly easily with `Quaternion * Vector3`. Here is a little example showing what I mean:

```cs
private void OnDrawGizmos()
{
    //Perturb vector along global y by -angle and +angle
    Quaternion rotLeft  = Quaternion.AngleAxis(-angle, Vector3.up);
    Quaternion rotRight = Quaternion.AngleAxis(angle, Vector3.up);

    //Rotate the vector locally, about the y axis
    Vector3 transformedVecLeft = rotLeft * originalVector;
    Vector3 transformedVecRight = rotRight * originalVector;

    //Show transformed local left & right
    DrawSolidLine(Vector3.zero, transformedVecLeft, Color.yellow);
    DrawSolidLine(Vector3.zero, transformedVecRight, Color.yellow);

    //Show original vector and y axis
    DrawDashedLine(Vector3.zero, originalVector, Color.yellow);
    DrawDashedLine(Vector3.up, -Vector3.up, Color.white);

    //Draw debug text
    Handles.Label(originalVector, $"vector = {originalVector}\nangle = {angle}");
}
```

When `originalVector` is set to `Vector.left`, for example, you can see the result changing the `angle` value:

![gif](img/quats/rotate-vec.gif)

This works locally for the vector, regardless of where it is in space. Adding some more code to help visualise the transformation:

```cs
//Draw ordinate/abscissa lines to help visualise in 3D
Vector3 projRight = Vector3.ProjectOnPlane(transformedVecRight, Vector3.up);
Vector3 projLeft = Vector3.ProjectOnPlane(transformedVecLeft, Vector3.up);

//Draw them
DrawDashedLine(transformedVecRight, projRight, Color.gray);
DrawDashedLine(transformedVecLeft, projLeft, Color.gray);
DrawDashedLine(Vector3.zero, projRight, Color.gray);
DrawDashedLine(Vector3.zero, projLeft, Color.gray);
DrawDashedLine(projLeft, projRight, Color.gray);
```

We can see that the rotation is applied locally to the vector's orientation, which is pretty neat:

![gif](img/quats/rotate-vec3d.gif)

A more robust example is seen below, implementing the cone of inaccuracy I mentioned earlier.

```cs
private void Update()
{
    //Find random x and y angles to perturb by
    float perturbAmountX = Random.Range(-angle, angle) / 2f;
    float perturbAmountY = Random.Range(-angle, angle) / 2f;

    //Build gun's rotation given the vector
    Quaternion gunRotation = Quaternion.LookRotation(originalVector, Vector3.up);

    //Rotate around gun's local y (rot * up) and local x (rot * right) vector, by random angles
    //calculated earlier. These are stored as two separate rotations.
    Quaternion perturbY = Quaternion.AngleAxis(perturbAmountX, gunRotation * Vector3.up);
    Quaternion perturbX = Quaternion.AngleAxis(perturbAmountY, gunRotation * Vector3.right);

    //Combine these two rotations with the * operator (more on this later!)
    Quaternion combinedPerturbance = perturbY * perturbX;

    //Rotate the vector by this perturbance rotation
    Vector3 rotatedVec = combinedPerturbance * originalVector;

    //Draw the original vector and the randomly perturbed one
    Debug.DrawLine(Vector3.zero, originalVector, Color.yellow);
    Debug.DrawLine(Vector3.zero, rotatedVec, Color.gray, 0.1f);

    //Draw axes
    Debug.DrawLine(Vector3.zero, gunRotation * Vector3.up, Color.red);
    Debug.DrawLine(Vector3.zero, gunRotation * Vector3.right, Color.blue);
}
```

There is something to note here, the fact that we combined two rotations into one with the `Quaternion * Quaternion` operator. We haven't yet discussed this, but it will be the next topic of discussion. Also note that we build a new quaternions for the perturbance on $x$ and $y$. These are rotated around the local axes of the gun's rotation; note that `gunRotation * Vector3.up` is used. If we used `Vector3.up` instead, this would apply the rotation in global space -- we want the perturbance to be local to the orientation of the gun, hence these lines.

We then combine the two rotations by multiplying them together. These then rotate the vector representing the gun's direction by the perturbance rotation. Then, we draw various lines to visually show what is happening:

![gif](img/quats/firecone.gif)

And now we have a gun with a variable level of inaccuracy, specified by an angular perturbance, all thanks to some obscure `Quaternion` knowledge!



## Quaternion * Quaternion
"Addition" of two rotations, combines first then second.
- Discuss manual multiplication (see [here](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Quaternion.cs))

## Quaternion == Quaternion
Abc

## Quaternion.Dot
- Measuring correlates between two rotations
- Manual equality test if $\mathbf{q} \cdot \mathbf{p} \leqslant 1.0$, which is what `q == p` does.
- Note double cover and solution for co-terminality of rots. 

## FromToRotation
- Note use for rotational fixes, e.g. fbx exports where $z = y$

## Quaternion.Normalize / .normalized
Discuss alternative to Vector3. Show diagram showing non-unit Quaternions.
- Note lack of Magnitude function but can be calc'd with ` float mag = Mathf.Sqrt(Dot(q, q));`

## Orthonormal basis from quaternion
Quaternion * Vector3 for u/d/r/f

## Quaternion.LookRotation
Building rotations looking through a Vector

## Quaternion.RotateTowards
Common confusion with Slerp()

## Quaternion.Inverse
World -> Local rotational conversion without transform. Good to gauge relative position of one point against another. Rotational inverse of another.

## Vector3.ProjectOnPlane
Not quaternion, but still incredibly useful.