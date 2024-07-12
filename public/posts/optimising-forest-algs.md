# Procedural Content Generation
One area which remains a fascinating research topic to me concerns algorithms for Procedural Content Generation (PCG). PCG largely concerns the automatic and algorithmic generation of content, for games, media, and much more. For example, the procedural generation of 3D buildings would concern how 3D buildings can be automatically generated, as opposed to a manual design approach. PCG has a number of benefits, but the primary motivator for its use in games regards the lack of a manual design approach -- development times are reduced, a large amount of content can be generated in an instant, etc. Lots of examples can be found on the [/r/proceduralgeneration](https://www.reddit.com/r/proceduralgeneration/?rdt=38901) subreddit if you are interested in some more concrete examples.

A number of articles I have published throughout my career novel procedural generation approaches. In fact, in my second year of my bachelor's degree, I started work on my first paper -- the procedural generation of virtual forests.

## Procedural Forestry
Generating a virtual forest is actually quite easy. The easiest approach is to sample a bunch of random points in some closed space, and then distribute trees according to these sampled points. For example, consider the following C++. This is a simple pseudo-random number generator:

```cpp
//Properties for the RNG
std::random_device device;
std::mt19937 randomGenerator(device());

/// <summary>
/// Returns a random float between {min} and {max}
/// </summary>
/// <param name="min">The minimum value</param>
/// <param name="max">The maximum value</param>
/// <returns>A random number</returns>
float random(const float min, const float max)
{
    //We have to do this because if the ranges aren't
    //ordered then C++ will throw an error
    float trueMin = std::min(min, max);
    float trueMax = std::max(max, min);

    //Build a uniform distribution
    std::uniform_real_distribution<float> udist(trueMin, trueMax);

    //Sample the distribution using the generator
    return udist(randomGenerator);
}
```

We can then use this to produce random coordinates:

```cpp
/// <summary>
/// Represents a 2-component vector (x, y)
/// </summary>
typedef struct Vector2
{
    float x;
    float y;
} Vector2;

/// <summary>
/// Generates a random point in the unit square
/// </summary>
Vector2 RandomPointInUnitSquare()
{
    return Vector2 
    { 
        random(0.0f, 1.0f),
        random(0.0f, 1.0f)
    };
}
```

We could use `RandomPointInUnitSquare()` to generate a number of pseudo-random points and then spawn trees at these sampled positions. This is perhaps the easiest and least-computational method of producing a virtual forest, with respect to the generative process. But does this produce nice, realistic looking forests?

We previous considered this in [our paper](https://www.mdpi.com/2073-431X/9/1/20), and we found that actually it really depends on the perspective you're viewing the forest from. If you're situated within the virtual forest, it doesn't really matter -- pseudo-random uniform distributions produce forests which look believable. However, if you're viewing the distribution from above, it does matter. We found that:

- Participants seem to like tightly-clustered dense distributions with equidistant spacing between tree instances.
- Participants consider large open clearings to be a fundamental component of generated forestry.
- Algorithms which are not pure pseudo-random distributions generally receive a higher degree of perceived believability.

In our paper, we compared three algorithms: a pseudo-random uniform distribution, a bio-inspired plant competition model and a hybrid approach. We found that generally, the plant competition model produced more believable forestry from a top-down perspective. So problem solved right? Plant competition models are the best? Unfortunately not.

## Plant competition models and their problems
A plant competition model essentially involves the individual simulation of each tree in the forest. Plants can grow, spread their seed, age and die within the forest. There is also a simulated level of competition between plants for resources. We find this in nature; plants in close proximity compete for soil moisture and sunlight. Plants which are larger can occlude sunlight to smaller plants, limiting their growth and potentially killing them off. Plant competition models embody this principle: trees in a forest are individual simulated, and compete for resources with each other.

The issue with this is the complexity of simulating forests with software:

- Forests potentially have hundreds of thousands of trees in them. Individually simulating this many trees in real-time is a considerable task.
- For a given tree T, it has to look up potentially every other tree to find trees local to it. This yields a naive time complexity of O(n^2); which is *drastically* slow.

Plant competition models are slow, but that is fine for ecologists and those interested in simulating them for predicting forest growth. They can press "Simulate" and come back after a few hours; offline simulation is fine in this regard. But what if we want to simulate this in real-time? What if we want to simulate forest growth in real-time, to add to immersive virtual worlds? What if we wanted to simulate forest development in games, which are by their design, real-time applications?

It is with this motivation in mind that my latest paper, submitted to CGVC'24, covers an optimisation strategy in a popular games engine to make this process blisteringly fast.

# Abc