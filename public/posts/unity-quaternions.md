# Introduction
Coming soon. Here are some rough notes. Show recent trip to Dublin.

## Quaternion * Vector3
Translation into local space of quaternion. TransformPoint but without transform.
- Non-commutativity
- Transformation into spaces
- Vector rotation

## Quaternion.Dot
- Measuring correlates between two rotations
- Manual equality test if $\mathbf{q} \cdot \mathbf{p} \leqslant 1.0$, which is what `q == p` does.
- Note double cover and solution for co-terminality of rots. 

## FromToRotation
- Note use for rotational fixes, e.g. fbx exports where $z = y$

## Quaternion.Normalize / .normalized
Discuss alternative to Vector3. Show diagram showing non-unit Quaternions.
- Note lack of Magnitude function but can be calc'd with ` float mag = Mathf.Sqrt(Dot(q, q));`

## Quaternion * Quaternion
"Addition" of two rotations, combines first then second.
- Discuss manual multiplication (see [here](https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Quaternion.cs))

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