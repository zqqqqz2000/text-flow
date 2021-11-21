import { RangeSlider, Text, RangeSliderFilledTrack, RangeSliderThumb, RangeSliderTrack, Box, Button, Flex, Spacer, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Stack } from "@chakra-ui/react";
import { useState } from "react";

export type DisplayRange = {
    offset: number,
    limit: number,
};

export type DisplayRangeSelectorProps = {
    size?: number;
    onChange?: (value: DisplayRange) => void;
    maxLimit?: number;
};

export const DisplayRangeSelector: React.FC<DisplayRangeSelectorProps> = ({ size, onChange, maxLimit }) => {
    const [displayRange, setDisplayRange_] = useState<DisplayRange>({
        offset: 0,
        limit: 0,
    });
    const setDisplayRange = (value: DisplayRange) => {
        onChange?.(value);
        setDisplayRange_(value);
    };
    const getOffsetValid = (offset: number) => {
        const valid = offset >= 0 && offset + displayRange.limit < (size ?? 0);
        if (valid) {
            return offset;
        } else {
            if (offset < 0) {
                return 0;
            } else {
                if (offset + displayRange.limit >= (size ?? 0)) {
                    return (size ?? 0) - displayRange.limit - 1;
                }
            }
        }
        return displayRange.offset;
    };
    const getLimitValid = (limit: number) => {
        const vaild = limit >= 0 && limit + displayRange.offset < (size ?? 0) && limit <= (maxLimit ?? Infinity);
        if (vaild) {
            return limit;
        } else {
            if (limit < 0) {
                return 0;
            } else if (limit >= (maxLimit ?? Infinity)) {
                return (maxLimit ?? Infinity);
            } else if (limit + displayRange.offset >= (size ?? 0)) {
                return (size ?? 0) - displayRange.offset - 1;
            }
        }
        return displayRange.limit;
    };
    return <Box mb={4} minH={100}>
        <Text textColor={size ? 'black' : 'grey'}>limit: {displayRange.limit} size: {size}</Text>
        <Flex mt={3}>
            <Stack shouldWrapChildren direction="row">
                <Button
                    isDisabled={!size}
                    size='xs'
                    onClick={() => setDisplayRange({
                        ...displayRange,
                        offset: getOffsetValid(displayRange.offset - displayRange.limit),
                    })}
                >{'<'}</Button>
                <NumberInput
                    isDisabled={!size}
                    size="xs"
                    max={size}
                    defaultValue={displayRange.offset}
                    onChange={(_, value) => setDisplayRange({
                        ...displayRange,
                        offset: getOffsetValid(value),
                    })}
                    value={displayRange.offset}
                    min={0}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Button
                    isDisabled={!size}
                    size='xs'
                    onClick={() => setDisplayRange({
                        ...displayRange,
                        offset: getOffsetValid(displayRange.offset + displayRange.limit),
                    })}
                >{'>'}</Button>
            </Stack>
            <Spacer />
            <Stack shouldWrapChildren direction="row">
                <Button
                    isDisabled={!size}
                    size='xs'
                    onClick={() => setDisplayRange({
                        ...displayRange,
                        limit: getLimitValid(displayRange.limit - Math.floor((maxLimit ?? size ?? 0) / 100)),
                    })}>{'<'}</Button>
                <NumberInput
                    isDisabled={!size}
                    size="xs"
                    max={size}
                    defaultValue={displayRange.limit}
                    onChange={(_, value) => setDisplayRange({
                        ...displayRange,
                        limit: getLimitValid(value),
                    })}
                    value={displayRange.limit}
                    min={0}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Button
                    isDisabled={!size}
                    size='xs'
                    onClick={() => setDisplayRange({
                        ...displayRange,
                        limit: getLimitValid(displayRange.limit + Math.floor((maxLimit ?? size ?? 0) / 100)),
                    })}
                >{'>'}</Button>
            </Stack>
        </Flex>
        <RangeSlider
            mt={3}
            isDisabled={!size}
            max={size ?? 0}
            defaultValue={[0, 0]}
            value={[displayRange.offset, displayRange.offset + displayRange.limit]}
            onChange={(value) => {
                if (
                    value[1] - value[0] >= (maxLimit ?? Infinity) && // valid
                    value[1] > displayRange.limit + displayRange.offset // direction right
                ) {
                    setDisplayRange({
                        offset: getOffsetValid(value[0] + (value[1] - value[0]) - (maxLimit ?? 0)),
                        limit: getLimitValid(maxLimit ?? Infinity),
                    });
                } else {
                    setDisplayRange({
                        offset: getOffsetValid(value[0]),
                        limit: getLimitValid(value[1] - value[0]),
                    });
                }
            }}
        >
            <RangeSliderTrack>
                <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb justifyContent='start' index={0}>
                <Text mt={8} whiteSpace='nowrap'>
                    offset: {displayRange.offset} bytes
                </Text>
            </RangeSliderThumb>
            <RangeSliderThumb justifyContent='end' index={1}>
                <Text mt={16} whiteSpace='nowrap'>
                    end: {displayRange.offset + displayRange.limit} bytes
                </Text>
            </RangeSliderThumb>
        </RangeSlider>
    </Box>;
};
